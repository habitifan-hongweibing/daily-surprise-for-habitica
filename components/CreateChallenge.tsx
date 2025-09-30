import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { createDaily } from '../services/habiticaService';
import { PRESET_TASKS, AI_PROMPT } from '../constants';
import type { Challenge, HabiticaUser, HabiticaDaily, CustomPreset } from '../types';
import Modal from './Modal';

const defaultPresets = Object.keys(PRESET_TASKS).map(key => ({
    name: key,
    tasks: PRESET_TASKS[key],
}));

const dayMap = { m: 'Mo', t: 'Tu', w: 'We', th: 'Th', f: 'Fr', s: 'Sa', su: 'Su' };
const dayKeys = ['m', 't', 'w', 'th', 'f', 's', 'su'];

const CreateChallenge: React.FC = () => {
    const [challenges, setChallenges] = useLocalStorage<Challenge[]>('challenges', []);
    const [user] = useLocalStorage<HabiticaUser | null>('habitica-user', null);
    
    const [presets, setPresets] = useLocalStorage<CustomPreset[]>('all-presets', defaultPresets);

    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [challengeName, setChallengeName] = useState('');
    const [taskBank, setTaskBank] = useState('');
    const [scheduleType, setScheduleType] = useState<'daily' | 'weekly'>('daily');
    const [weeklyRepeats, setWeeklyRepeats] = useState<{ [key: string]: boolean }>({ m: true, t: true, w: true, th: true, f: true, s: true, su: true });
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<string[]>([]);
    const [promptCopied, setPromptCopied] = useState(false);

    const handlePresetSelect = (tasks: string[]) => {
        setTaskBank(tasks.join('\n'));
    };

    const handleViewPreset = (tasks: string[]) => {
        setModalContent(tasks);
        setIsModalOpen(true);
    };
    
    const handleCopyPrompt = () => {
      navigator.clipboard.writeText(AI_PROMPT);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    };

    const handleToggleDay = (day: string) => {
        setWeeklyRepeats(prev => ({ ...prev, [day]: !prev[day] }));
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError('');
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error('File content is not text.');
                const preset = JSON.parse(text);
                
                if (!preset.name || !Array.isArray(preset.tasks) || !preset.tasks.every((t: any) => typeof t === 'string')) {
                    throw new Error('Invalid preset format. Expected JSON with "name": string and "tasks": string[].');
                }
                
                if (presets.some(p => p.name === preset.name)) {
                     throw new Error(`A preset named "${preset.name}" already exists.`);
                }

                setPresets(currentPresets => [...currentPresets, preset]);
            } catch (err) {
                setError((err as Error).message);
            }
        };
        reader.onerror = () => setError('Failed to read the file.');
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    };
    
    const handleDeletePreset = (presetName: string) => {
        if (window.confirm(`Are you sure you want to delete the "${presetName}" preset?`)) {
            setPresets(currentPresets => currentPresets.filter(p => p.name !== presetName));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!user || !user.userId || !user.apiToken) {
            setError('Please set your User ID and API Token in the Profile section.');
            return;
        }
        if (!challengeName.trim() || !taskBank.trim()) {
            setError('Challenge Name and Task Bank cannot be empty.');
            return;
        }
        
        setIsCreating(true);

        const habiticaTask: HabiticaDaily = {
            text: challengeName,
            notes: `Your task will appear here! To update, visit [Daily Surprise](https://habitifan-hongweibing.github.io/daily-surprise-for-habitica/#/challenges).`,
            type: 'daily',
            frequency: scheduleType,
            startDate: new Date(startDate),
            ...(scheduleType === 'weekly' && { repeat: weeklyRepeats })
        };
        
        try {
            const newHabiticaTask = await createDaily(user, habiticaTask);
            if (!newHabiticaTask._id) {
                throw new Error("Failed to get task ID from Habitica.");
            }

            const newChallenge: Challenge = {
                id: crypto.randomUUID(),
                name: challengeName,
                tasks: taskBank.split('\n').filter(t => t.trim() !== ''),
                usedTasks: [],
                habiticaTaskId: newHabiticaTask._id,
                schedule: { type: scheduleType, repeats: weeklyRepeats },
                startDate: startDate,
            };

            setChallenges([...challenges, newChallenge]);
            navigate('/challenges');
        } catch (err) {
            console.error(err);
            setError((err as Error).message || 'An unknown error occurred.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Preset Tasks">
                <ul className="list-disc list-inside max-h-96 overflow-y-auto">
                    {modalContent.map((task, index) => <li key={index}>{task}</li>)}
                </ul>
            </Modal>
            <div className="max-w-4xl mx-auto bg-habitica-dark p-6 sm:p-8 rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold mb-6 text-center text-habitica-light">Create New Challenge</h1>
                {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-900/20 p-2 rounded-md">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    <div>
                        <h2 className="block text-lg font-medium text-habitica-text-secondary mb-4">Task Presets</h2>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".json,application/json"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-habitica-main hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-md transition-colors mb-6 flex items-center justify-center space-x-2"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                           <span>Upload Preset from File</span>
                        </button>

                        <h4 className="text-sm font-semibold text-habitica-text-secondary mb-2">My Presets</h4>
                        {presets.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {presets.map(preset => (
                                    <div key={preset.name} className="bg-[#3b2a5e] p-3 rounded-md flex justify-between items-center border border-habitica-main">
                                        <span className="font-semibold text-sm truncate pr-2" title={preset.name}>{preset.name}</span>
                                        <div className="space-x-2 flex items-center flex-shrink-0">
                                            <button type="button" onClick={() => handleViewPreset(preset.tasks)} className="text-xs bg-habitica-main px-2 py-1 rounded hover:bg-opacity-80">View</button>
                                            <button type="button" onClick={() => handlePresetSelect(preset.tasks)} className="text-xs bg-habitica-light text-habitica-darker px-2 py-1 rounded hover:bg-opacity-80">Select</button>
                                            <button type="button" onClick={() => handleDeletePreset(preset.name)} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                           <p className="text-center text-habitica-text-secondary text-sm py-4">Your preset library is empty. Upload a preset to get started!</p>
                        )}
                    </div>

                    <div className="bg-[#3b2a5e] p-4 rounded-md border border-habitica-main">
                        <p className="text-habitica-text-secondary mb-3">If you don't like any of the preset task banks and also don't want or can't create your own task bank yourself, you can copy this prompt and paste it into any LLM model to create an individual task bank.</p>
                        <button type="button" onClick={handleCopyPrompt} className="text-habitica-light hover:underline font-mono bg-habitica-darker p-2 rounded w-full text-left relative">
                            prompt
                            <span className="absolute right-2 top-2 text-xs transition-opacity duration-300">
                              {promptCopied ? 'Copied!' : 'Click to copy'}
                            </span>
                        </button>
                    </div>

                    <div>
                        <h2 className="block text-lg font-medium text-habitica-text-secondary mb-4">Challenge Details</h2>
                        <div className="space-y-4">
                             <input
                                type="text"
                                id="challengeName"
                                value={challengeName}
                                onChange={(e) => setChallengeName(e.target.value)}
                                className="w-full bg-[#3b2a5e] border border-habitica-main rounded-md px-3 py-2 text-habitica-text focus:outline-none focus:ring-2 focus:ring-habitica-light"
                                placeholder="Challenge Name (e.g., 'My Mindfulness Journey')"
                            />
                            <textarea
                                id="taskBank"
                                rows={8}
                                value={taskBank}
                                onChange={(e) => setTaskBank(e.target.value)}
                                className="w-full bg-[#3b2a5e] border border-habitica-main rounded-md px-3 py-2 text-habitica-text focus:outline-none focus:ring-2 focus:ring-habitica-light"
                                placeholder="Task Bank (selected presets will appear here)"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="block text-lg font-medium text-habitica-text-secondary mb-4">Schedule</h2>
                        <div className="flex space-x-2 rounded-lg bg-[#3b2a5e] p-1 border border-habitica-main mb-4">
                            <button type="button" onClick={() => setScheduleType('daily')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${scheduleType === 'daily' ? 'bg-habitica-light text-habitica-darker' : 'text-habitica-text-secondary hover:bg-habitica-main'}`}>Daily</button>
                            <button type="button" onClick={() => setScheduleType('weekly')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${scheduleType === 'weekly' ? 'bg-habitica-light text-habitica-darker' : 'text-habitica-text-secondary hover:bg-habitica-main'}`}>Weekly</button>
                        </div>
                        {scheduleType === 'weekly' && (
                            <div className="flex justify-center space-x-1 sm:space-x-2 bg-habitica-darker p-2 rounded-md">
                                {dayKeys.map(day => (
                                    <button type="button" key={day} onClick={() => handleToggleDay(day)} className={`w-10 h-10 rounded-full font-bold transition-colors ${weeklyRepeats[day] ? 'bg-habitica-light text-habitica-darker' : 'bg-[#3b2a5e] text-habitica-text-secondary hover:bg-habitica-main'}`}>
                                        {dayMap[day as keyof typeof dayMap]}
                                    </button>
                                ))}
                            </div>
                        )}
                         <div className="mt-4">
                            <label htmlFor="startDate" className="block text-sm font-medium text-habitica-text-secondary mb-1">Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-[#3b2a5e] border border-habitica-main rounded-md px-3 py-2 text-habitica-text focus:outline-none focus:ring-2 focus:ring-habitica-light"
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full bg-habitica-light hover:bg-opacity-80 text-habitica-darker font-bold py-3 px-4 rounded-md transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isCreating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Creating...
                            </>
                        ) : 'Create in Habitica'}
                    </button>
                </form>
            </div>
        </>
    );
};

export default CreateChallenge;
