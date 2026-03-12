import { motion } from "framer-motion";
import { History, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HistoryEntry {
  id: number;
  date: string;
  event: string;
  location: string;
  riskLevel: "low" | "medium" | "high";
  status: "resolved" | "new" | "pending";
}

const historyData: HistoryEntry[] = [
  { id: 1, date: "Jan 14, 2026", event: "Motion Alert", location: "Parking Lot B", riskLevel: "high", status: "resolved" },
  { id: 2, date: "Jan 13, 2026", event: "Noise Detection", location: "Library", riskLevel: "low", status: "resolved" },
  { id: 3, date: "Jan 12, 2026", event: "Security Breach", location: "Admin Building", riskLevel: "high", status: "new" },
  { id: 4, date: "Jan 11, 2026", event: "System Check", location: "Campus Wide", riskLevel: "low", status: "resolved" },
  { id: 5, date: "Jan 10, 2026", event: "Emergency Drill", location: "Student Center", riskLevel: "medium", status: "resolved" },
  { id: 6, date: "Jan 9, 2026", event: "Power Outage", location: "Science Building", riskLevel: "medium", status: "pending" },
  { id: 7, date: "Jan 8, 2026", event: "Access Violation", location: "Server Room", riskLevel: "high", status: "resolved" },
];

const HistoryTable = () => {
  const getRiskBadge = (level: HistoryEntry["riskLevel"]) => {
    const styles = {
      low: "bg-success/20 text-success border-success/30",
      medium: "bg-warning/20 text-warning border-warning/30",
      high: "bg-destructive/20 text-destructive border-destructive/30",
    };
    return styles[level];
  };

  const getStatusBadge = (status: HistoryEntry["status"]) => {
    const styles = {
      resolved: "status-resolved",
      new: "status-new",
      pending: "status-pending",
    };
    return styles[status];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-primary" />
          <h2 className="font-orbitron text-lg font-semibold text-foreground">Last 7 Days History</h2>
        </div>
        <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-orbitron text-xs">Date</TableHead>
              <TableHead className="text-muted-foreground font-orbitron text-xs">Event</TableHead>
              <TableHead className="text-muted-foreground font-orbitron text-xs">Location</TableHead>
              <TableHead className="text-muted-foreground font-orbitron text-xs">Risk Level</TableHead>
              <TableHead className="text-muted-foreground font-orbitron text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyData.map((entry, index) => (
              <motion.tr
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                className="border-border hover:bg-primary/5 transition-colors cursor-pointer group"
              >
                <TableCell className="text-sm text-muted-foreground">{entry.date}</TableCell>
                <TableCell className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {entry.event}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.location}</TableCell>
                <TableCell>
                  <span className={`status-badge border ${getRiskBadge(entry.riskLevel)}`}>
                    {entry.riskLevel.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`status-badge ${getStatusBadge(entry.status)}`}>
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  </span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default HistoryTable;