'use client';

import React from 'react';
import { Mutation } from '@/lib/types';

interface MutationSelectionProps {
  mutations: Mutation[];
  onSelectMutation: (mutation: Mutation) => void;
}

export default function MutationSelection({ mutations, onSelectMutation }: MutationSelectionProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-white text-center">
        <h2 className="text-3xl font-bold mb-6">突然変異を選択</h2>
        <div className="flex justify-center gap-6">
          {mutations.map(mutation => (
            <div
              key={mutation.id}
              className="bg-gray-700 p-5 rounded-md flex-1 cursor-pointer hover:bg-gray-600 transition-colors border-2 border-blue-500 whitespace-normal"
              onClick={() => onSelectMutation(mutation)}
            >
              <h3 className="text-xl font-semibold mb-2">{mutation.name}</h3>
              <p className="text-sm text-gray-300">{mutation.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
