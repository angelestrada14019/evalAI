
'use client'

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusCircle, X, PanelLeft, Settings2 } from "lucide-react";

interface MobileFABProps {
    onElementsClick: () => void;
    onPropertiesClick: () => void;
}

export function MobileFAB({ onElementsClick, onPropertiesClick }: MobileFABProps) {
    const [isFabOpen, setIsFabOpen] = useState(false);
    const t = useTranslations('FormBuilderPage');
    
    const handleElementsClick = () => {
        setIsFabOpen(false);
        onElementsClick();
    }

    const handlePropertiesClick = () => {
        setIsFabOpen(false);
        onPropertiesClick();
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className="relative flex flex-col-reverse items-center gap-2">
                
                {/* Secondary action buttons */}
                <div className={cn(
                    "transition-all duration-300 ease-in-out flex flex-col-reverse items-center gap-2",
                    isFabOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                )}>
                    <Button variant="default" size="icon" className="shadow-lg rounded-full h-12 w-12" onClick={handlePropertiesClick}>
                        <Settings2 className="h-6 w-6" />
                        <span className="sr-only">{t('properties')}</span>
                    </Button>
                    <Button variant="default" size="icon" className="shadow-lg rounded-full h-12 w-12" onClick={handleElementsClick}>
                        <PanelLeft className="h-6 w-6" />
                        <span className="sr-only">{t('formElements')}</span>
                    </Button>
                </div>

                {/* Main FAB */}
                <Button 
                    variant="default" 
                    size="icon" 
                    className="shadow-lg rounded-full h-16 w-16 z-10"
                    onClick={() => setIsFabOpen(prev => !prev)}
                >
                    {isFabOpen ? <X className="h-7 w-7" /> : <PlusCircle className="h-7 w-7" />}
                </Button>
            </div>
        </div>
    )
}

    