'use client'

import React, { useState } from 'react';

interface RelevantDoc {
    law_nazev: string;
    law_id: string;
    law_year: string;
    law_category: string;
    law_date: string;
    law_staleURL: string;
    paragraph_cislo: string;
    paragraph_zneni: string;
}

interface RelevantDocsSidebarProps {
    relevantDocs: RelevantDoc[];
}

export function RelevantDocsSidebar({ relevantDocs }: RelevantDocsSidebarProps) {
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

    return (
        <div className="absolute right-0 inset-y-0 z-30 w-[300px] bg-white dark:bg-black border-l shadow-lg overflow-y-auto">
            <h3 className="p-4 border-b text-xl font-bold bg-gray-100 dark:bg-gray-800">Relevant Documents</h3>
            <ul>
                {relevantDocs.map((doc, index) => (
                    <li key={index} className="p-2 border-b">
                        <div>
                            <span>§ {doc.paragraph_cislo} zákona č. {doc.law_id}/{doc.law_year} Sb.</span>
                            <a href={`https://www.zakonyprolidi.cz/cs/${doc.law_year}-${doc.law_id}#p${doc.paragraph_cislo}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline ml-2">Link</a>
                        </div>
                        <div>{doc.law_nazev}</div>
                        <button
                            onClick={() => setSelectedDoc(selectedDoc === doc.paragraph_cislo ? null : doc.paragraph_cislo)}
                            className="text-sm text-blue-500 underline"
                        >
                            {selectedDoc === doc.paragraph_cislo ? 'Hide Paragraph' : 'Show Paragraph'}
                        </button>
                        {selectedDoc === doc.paragraph_cislo && (
                            <p className="mt-2 dark:text-white">{doc.paragraph_zneni}</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}