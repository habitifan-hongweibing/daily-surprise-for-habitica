import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { updateDailyNotes, deleteDaily } from '../services/habiticaService';
import type { Challenge, HabiticaUser } from '../types';
import RandomizerAnimation from './RandomizerAnimation';

const ChallengeCard: React.FC<{
  challenge: Challenge;
  onGenerate: (challengeId: string) => Promise<string>;
  onDelete: (challengeId: string, habiticaTaskId: string) => Promise<void>;
  user: HabiticaUser | null;
}> = ({ challenge, onGenerate, onDelete, user }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedTask, setGeneratedTask] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const unusedTasksCount = challenge.tasks.length - challenge.usedTasks.length;

    const handleGenerate = async () => {
        if (!user) {
            setError('Please set credentials in Profile.');
            return;
        }
        if (unusedTasksCount === 0) {
            setError('All tasks have been used!');
            return;
        }

        setIsGenerating(true);
        setError('');
        setGeneratedTask(null);

        try {
            const task = await onGenerate(challenge.id);
            setGeneratedTask(task);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setTimeout(() => setIsGenerating(false), 2000); // Let animation finish
        }
    };
    
    const handleDelete = async () => {
        if (!user) {
            setError('Please set credentials in Profile.');
            return;
        }
        if (window.confirm(`Are you sure you want to delete the "${challenge.name}" challenge? This will also delete the daily task from Habitica.`)) {
            setIsDeleting(true);
            setError('');
            try {
                await onDelete(challenge.id, challenge.habiticaTaskId);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleDownload = () => {
        const preset = {
            name: challenge.name,
            tasks: challenge.tasks,
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(preset, null, 2));
        const downloadAnchorNode = document.createElement('a');
        const safeName = challenge.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${safeName}_preset.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="bg-habitica-dark p-6 rounded-lg shadow-xl border border-habitica-main flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-bold text-habitica-light mb-2">{challenge.name}</h3>
                <p className="text-sm text-habitica-text-secondary mb-4">
                    {unusedTasksCount} / {challenge.tasks.length} tasks remaining
                </p>
                <div className="min-h-[60px] bg-habitica-darker p-3 rounded-md mb-4 flex items-center justify-center">
                    {isGenerating ? (
                        <RandomizerAnimation final_text={generatedTask || ''} />
                    ) : generatedTask ? (
                        <p className="text-center text-green-400">"{generatedTask}" sent to Habitica!</p>
                    ) : (
                        <p className="text-center text-habitica-text-secondary italic">Click generate to get today's task</p>
                    )}
                </div>
            </div>
            {error && <p className="text-red-400 text-xs text-center my-2">{error}</p>}
            <div className="flex space-x-2">
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || unusedTasksCount === 0}
                    className="w-full bg-habitica-light hover:bg-opacity-80 text-habitica-darker font-bold py-2 px-4 rounded-md transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? 'Generating...' : "Generate Today's Task"}
                </button>
                 <button
                    onClick={handleDownload}
                    className="flex-shrink-0 bg-habitica-main hover:bg-opacity-80 text-white font-bold py-2 px-3 rounded-md transition-colors"
                    title="Download as Preset"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md transition-colors disabled:bg-opacity-50"
                    title="Delete Challenge"
                >
                    {isDeleting ? '...' : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

const MyChallenges: React.FC = () => {
    const [challenges, setChallenges] = useLocalStorage<Challenge[]>('challenges', []);
    const [user] = useLocalStorage<HabiticaUser | null>('habitica-user', null);

    const handleGenerateTask = async (challengeId: string): Promise<string> => {
        if (!user) throw new Error("User credentials not found.");

        const challengeIndex = challenges.findIndex(c => c.id === challengeId);
        if (challengeIndex === -1) throw new Error("Challenge not found.");
        
        const challenge = challenges[challengeIndex];
        const unusedTasks = challenge.tasks.filter(t => !challenge.usedTasks.includes(t));

        if (unusedTasks.length === 0) throw new Error("No unused tasks left.");

        const randomIndex = Math.floor(Math.random() * unusedTasks.length);
        const selectedTask = unusedTasks[randomIndex];

        const newNotes = `Your task today:\n${selectedTask}\nTo get a new one, visit the Daily Surprise app.`;

        await updateDailyNotes(user, challenge.habiticaTaskId, newNotes);

        const updatedChallenge = {
            ...challenge,
            usedTasks: [...challenge.usedTasks, selectedTask],
        };
        const updatedChallenges = [...challenges];
        updatedChallenges[challengeIndex] = updatedChallenge;
        setChallenges(updatedChallenges);

        return selectedTask;
    };
    
    const handleDeleteChallenge = async (challengeId: string, habiticaTaskId: string) => {
        if (!user) throw new Error("User credentials not found.");
        
        await deleteDaily(user, habiticaTaskId);
        
        setChallenges(currentChallenges => currentChallenges.filter(c => c.id !== challengeId));
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center text-habitica-light">My Challenges</h1>
            {challenges.length === 0 ? (
                <div className="text-center bg-habitica-dark p-8 rounded-lg">
                    <p className="text-habitica-text-secondary">You haven't created any challenges yet.</p>
                    <Link to="/create" className="text-habitica-light hover:underline mt-2 inline-block">Create one now!</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map(challenge => (
                        <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            onGenerate={handleGenerateTask}
                            onDelete={handleDeleteChallenge}
                            user={user}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyChallenges;