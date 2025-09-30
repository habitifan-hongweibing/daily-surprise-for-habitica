import React, { useState, useEffect, useRef } from 'react';

interface RandomizerAnimationProps {
  final_text: string;
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

const RandomizerAnimation: React.FC<RandomizerAnimationProps> = ({ final_text }) => {
  const [displayText, setDisplayText] = useState('');
  const intervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let iteration = 0;
    const targetLength = final_text.length;

    // Start with a scrambling placeholder
    if (final_text) {
        setDisplayText(Array(targetLength).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join(''));
    }

    const scramble = () => {
        if (iteration >= targetLength) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            setDisplayText(final_text);
            return;
        }

        const newText = final_text
            .split('')
            .map((_, index) => {
                if (index < iteration) {
                    return final_text[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

        setDisplayText(newText);
        iteration += 1 / 2; // Slower reveal
    };

    if (final_text) {
        intervalRef.current = window.setInterval(scramble, 30);
    }
    
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [final_text]);
  
  if(!final_text) return <p className="text-habitica-light animate-pulse">Waiting for task...</p>;

  return (
    <p className="text-habitica-light font-mono text-center break-words" style={{ textShadow: '0 0 5px #c5a9ff' }}>
        {displayText}
    </p>
  );
};

export default RandomizerAnimation;
