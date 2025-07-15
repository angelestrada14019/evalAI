import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Eye, GripVertical, Save, Settings, Trash2 } from "lucide-react"
import { AIFormulaSuggester } from "@/components/evaluations/ai-formula-suggester"

const questionTypes = [
    { name: "Multiple Choice", icon: "list-checks" },
    { name: "Text Input", icon: "pilcrow" },
    { name: "Slider", icon: "sliders-horizontal" },
    { name: "Rating Scale", icon: "star" },
    { name: "Image Choice", icon: "image" },
    { name: "Matrix Table", icon: "table" },
    { name: "File Upload", icon: "upload" },
]

export default function FormBuilderPage({ params }: { params: { id: string }}) {
    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center justify-between p-4 border-b bg-card">
                <div>
                    <h1 className="text-xl font-bold">Quarterly Performance Review</h1>
                    <p className="text-sm text-muted-foreground">Editing evaluation form</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                    <AIFormulaSuggester />
                    <Button>
                        <Save className="mr-2 h-4 w-4" /> Save
                    </Button>
                </div>
            </header>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
                {/* Question Palette */}
                <aside className="md:col-span-2 border-r p-4 bg-card">
                    <h2 className="text-lg font-semibold mb-4">Form Elements</h2>
                    <div className="space-y-2">
                        {questionTypes.map((q) => (
                             <Button key={q.name} variant="ghost" className="w-full justify-start">
                                {/* Placeholder for specific icons */}
                                <span className="mr-2 text-muted-foreground">■</span>
                                {q.name}
                            </Button>
                        ))}
                    </div>
                </aside>

                {/* Form Canvas */}
                <main className="md:col-span-7 p-8 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Sample Question 1 */}
                        <Card className="p-4 border-2 border-primary shadow-lg">
                            <div className="flex items-start gap-4">
                                <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">1. Multiple Choice</p>
                                    <p className="font-semibold">How would you rate the code quality on the last project?</p>
                                    <div className="space-y-2 mt-2 text-sm">
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border"></div><span>Excellent</span></div>
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border"></div><span>Good</span></div>
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border"></div><span>Average</span></div>
                                        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border"></div><span>Poor</span></div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                            </div>
                        </Card>
                         {/* Sample Question 2 */}
                         <Card className="p-4">
                            <div className="flex items-start gap-4">
                                <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">2. Text Input</p>
                                    <p className="font-semibold">What are your main goals for the next quarter?</p>
                                    <Textarea placeholder="Type your answer here..." className="mt-2" disabled />
                                </div>
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                            </div>
                        </Card>
                         {/* Sample Question 3 */}
                         <Card className="p-4">
                            <div className="flex items-start gap-4">
                                <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">3. Slider</p>
                                    <p className="font-semibold">How likely are you to recommend our services?</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="text-sm text-muted-foreground">Not likely</span>
                                        <div className="w-full h-2 bg-secondary rounded-full" />
                                        <span className="text-sm text-muted-foreground">Very likely</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                            </div>
                        </Card>
                    </div>
                </main>

                {/* Properties Panel */}
                <aside className="md:col-span-3 border-l p-4 bg-card">
                    <h2 className="text-lg font-semibold mb-4">Properties</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Multiple Choice</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="question-text">Question Text</Label>
                                <Input id="question-text" defaultValue="How would you rate the code quality on the last project?" />
                            </div>
                            <div className="space-y-2">
                                <Label>Options</Label>
                                <Input defaultValue="Excellent" />
                                <Input defaultValue="Good" />
                                <Input defaultValue="Average" />
                                <Input defaultValue="Poor" />
                                <Button variant="outline" size="sm" className="w-full">Add Option</Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="required-switch">Required</Label>
                                <Switch id="required-switch" defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    )
}
