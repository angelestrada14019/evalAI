
'use client';

import { FormItem } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface VariablesPanelProps {
    items: FormItem[];
}

export function VariablesPanel({ items }: VariablesPanelProps) {
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const variables = items.filter(item => item.type !== 'Section Header');

    return (
        <div className="p-4 bg-card h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 sr-only">Variables</h2>
             {variables.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No variables yet.</p>
                    <p className="text-sm">Add questions to generate variables.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {variables.map(item => (
                        <Card key={item.id} className="text-sm">
                            <CardContent className="p-3 flex items-center justify-between">
                                <div>
                                    <p className="font-mono text-xs text-primary truncate">{item.variableId}</p>
                                    <p className="text-muted-foreground truncate text-xs">{item.label}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleCopy(item.variableId)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
