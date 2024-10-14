'use client'

import React from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '@/components/ui/dialog'; // Adjust the import path as necessary

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
    return (
        <div className="absolute right-0 inset-y-0 z-30 w-[300px] bg-white dark:bg-black border-l shadow-lg overflow-y-auto">
            <h3 className="p-4 border-b text-xl font-bold bg-gray-100 dark:bg-gray-800">
                Relevant Documents
            </h3>
            <ul>
                {relevantDocs.map((doc, index) => (
                    <li key={index} className="p-2 border-b">
                        <div>
              <span>
                § {doc.paragraph_cislo} zákona č. {doc.law_id}/{doc.law_year} Sb.
              </span>
                            <a
                                href={`https://www.zakonyprolidi.cz/cs/${doc.law_year}-${doc.law_id}#p${doc.paragraph_cislo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline ml-2"
                            >
                                Link
                            </a>
                        </div>
                        <div>{doc.law_nazev}</div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="text-sm text-blue-500 underline mt-2">
                                    Show Paragraph
                                </button>
                            </DialogTrigger>
                            <DialogContent
                                className="bg-white dark:bg-black rounded-lg max-w-3xl w-full mt-8"
                                // Wider max-width applied here with max-w-3xl
                            >
                                {/* Wrap content in a scrollable container */}
                                <div className="p-6 max-h-[70vh] overflow-y-auto">
                                    <DialogTitle className="text-xl font-bold mb-4 text-center">
                                        § {doc.paragraph_cislo} zákona č. {doc.law_id}/{doc.law_year} Sb.
                                    </DialogTitle>
                                    <DialogDescription className="mb-4 text-center">
                                        {doc.law_nazev}
                                    </DialogDescription>
                                    <p className="text-base whitespace-pre-wrap">
                                        {doc.paragraph_zneni}
                                    </p>
                                    {/* Centering the Close button */}
                                    <div className="flex justify-center">
                                        <DialogClose asChild>
                                            <button className="mt-6 text-blue-500 underline">Close</button>
                                        </DialogClose>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </li>
                ))}
            </ul>
        </div>
    );
}