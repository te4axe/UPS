import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "default" | "lg";
}

export default function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: "bg-gray-100 text-gray-800 border-gray-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      components_selected: "bg-yellow-100 text-yellow-800 border-yellow-200",
      assembly_started: "bg-orange-100 text-orange-800 border-orange-200",
      assembly_completed: "bg-purple-100 text-purple-800 border-purple-200",
      packaged: "bg-indigo-100 text-indigo-800 border-indigo-200",
      shipped: "bg-green-100 text-green-800 border-green-200",
      delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatStatus = (status: string) => {
    const statusLabels = {
      'created': 'Créé',
      'confirmed': 'Confirmé',
      'components_selected': 'Composants Sélectionnés',
      'assembly_started': 'Montage Démarré',
      'assembly_completed': 'Montage Terminé',
      'packaged': 'Emballé',
      'shipped': 'Expédié',
      'delivered': 'Livré'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    default: "text-xs px-2.5 py-0.5",
    lg: "text-sm px-3 py-1",
  };

  return (
    <Badge 
      variant="outline"
      className={`${getStatusColor(status)} ${sizeClasses[size]} font-medium border`}
    >
      {formatStatus(status)}
    </Badge>
  );
}
