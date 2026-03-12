import { motion } from "framer-motion";
import { Eye, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HistoryAlert {
  id: string;
  date: string;
  riskScore: number;
  trigger: string;
  status: "new" | "investigating" | "resolved" | "dismissed";
}

const mockHistory: HistoryAlert[] = [
  { id: "1", date: "2024-01-14 14:32", riskScore: 92, trigger: "SOS Button", status: "new" },
  { id: "2", date: "2024-01-14 13:15", riskScore: 78, trigger: "AI Detection", status: "investigating" },
  { id: "3", date: "2024-01-14 11:45", riskScore: 65, trigger: "Motion Sensor", status: "resolved" },
  { id: "4", date: "2024-01-14 09:22", riskScore: 88, trigger: "SOS Button", status: "resolved" },
  { id: "5", date: "2024-01-13 22:10", riskScore: 45, trigger: "AI Detection", status: "dismissed" },
  { id: "6", date: "2024-01-13 18:55", riskScore: 72, trigger: "Perimeter Alert", status: "resolved" },
  { id: "7", date: "2024-01-13 14:30", riskScore: 95, trigger: "SOS Button", status: "resolved" },
  { id: "8", date: "2024-01-13 10:15", riskScore: 55, trigger: "AI Detection", status: "dismissed" },
];

export const AlertHistoryTable = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="glass-panel p-6"
    >
      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-secondary/50 border-border/50">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear History
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border/50">
              <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Risk Score</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Trigger</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
              <TableHead className="text-muted-foreground font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockHistory.map((alert, index) => (
              <HistoryRow key={alert.id} alert={alert} index={index} />
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

const HistoryRow = ({ alert, index }: { alert: HistoryAlert; index: number }) => {
  const statusConfig = {
    new: { label: "New", class: "badge-critical" },
    investigating: { label: "Investigating", class: "badge-warning" },
    resolved: { label: "Resolved", class: "badge-success" },
    dismissed: { label: "Dismissed", class: "badge-info" },
  };

  const riskColor =
    alert.riskScore >= 80
      ? "text-destructive"
      : alert.riskScore >= 60
      ? "text-warning"
      : "text-success";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
      className="border-border/30 hover:bg-secondary/20 transition-colors"
    >
      <TableCell className="font-mono text-sm text-foreground">{alert.date}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              alert.riskScore >= 80
                ? "bg-destructive"
                : alert.riskScore >= 60
                ? "bg-warning"
                : "bg-success"
            }`}
          />
          <span className={`font-semibold ${riskColor}`}>{alert.riskScore}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{alert.trigger}</TableCell>
      <TableCell>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[alert.status].class}`}>
          {statusConfig[alert.status].label}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </TableCell>
    </motion.tr>
  );
};
