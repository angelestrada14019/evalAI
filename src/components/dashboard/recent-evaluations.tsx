import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

const evaluations = [
  { name: 'Olivia Martin', email: 'olivia.martin@email.com', score: 89.9, fallback: 'OM' },
  { name: 'Jackson Lee', email: 'jackson.lee@email.com', score: 92.5, fallback: 'JL' },
  { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', score: 78.3, fallback: 'IN' },
  { name: 'William Kim', email: 'will@email.com', score: 95.0, fallback: 'WK' },
  { name: 'Sofia Davis', email: 'sofia.davis@email.com', score: 81.2, fallback: 'SD' },
];

export function RecentEvaluations() {
  return (
    <div className="space-y-8">
      {evaluations.map((evalItem, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://placehold.co/100x100.png?text=${evalItem.fallback}`} alt="Avatar" data-ai-hint="person" />
            <AvatarFallback>{evalItem.fallback}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{evalItem.name}</p>
            <p className="text-sm text-muted-foreground">{evalItem.email}</p>
          </div>
          <div className="ml-auto font-medium">+{evalItem.score}</div>
        </div>
      ))}
    </div>
  )
}
