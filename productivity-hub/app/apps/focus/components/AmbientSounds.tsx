'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, CloudRain, Coffee, Trees, Wind } from 'lucide-react';

const SOUNDS = [
    { id: 'rain', name: 'Rain', icon: CloudRain, url: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1613.mp3' },
    { id: 'forest', name: 'Forest', icon: Trees, url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1210.mp3' },
    { id: 'cafe', name: 'Cafe', icon: Coffee, url: 'https://assets.mixkit.co/sfx/preview/mixkit-restaurant-crowd-talking-ambience-440.mp3' },
    { id: 'white', name: 'White Noise', icon: Wind, url: 'https://assets.mixkit.co/sfx/preview/mixkit-white-noise-1078.mp3' },
];

export function AmbientSounds() {
    const [activeSound, setActiveSound] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.5);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const toggleSound = (soundId: string) => {
        if (activeSound === soundId) {
            // Stop
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setActiveSound(null);
        } else {
            // Play new
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const sound = SOUNDS.find(s => s.id === soundId);
            if (sound) {
                const audio = new Audio(sound.url);
                audio.loop = true;
                audio.volume = volume;
                audio.play();
                audioRef.current = audio;
                setActiveSound(soundId);
            }
        }
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Volume2 size={16} />
                Ambient Sound
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {SOUNDS.map((sound) => {
                    const Icon = sound.icon;
                    const isActive = activeSound === sound.id;
                    return (
                        <button
                            key={sound.id}
                            onClick={() => toggleSound(sound.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${isActive
                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                    : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:border-gray-600'
                                }`}
                        >
                            <Icon size={24} className="mb-2" />
                            <span className="text-xs font-medium">{sound.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setVolume(v => v === 0 ? 0.5 : 0)}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
            </div>
        </div>
    );
}
