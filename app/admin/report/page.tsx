"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, XCircle, CornerUpLeft, X } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { textPrimary, buttonbg } from "@/contexts/theme";

// Mock Data
const reportsData = Array(8).fill(null).map((_, i) => ({
  id: "01",
  name: "Robert Fox",
  reason: "Unprofessional behavior",
  date: "02-24-2025",
  description: "User was being rude and using inappropriate language in the chat session."
}));

// Report Detail Modal
const ReportDetailModal = ({ isOpen, onClose, report }: { isOpen: boolean; onClose: () => void; report: any }) => {
  if (!isOpen) return null;
  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose} // Close on backdrop click
    >
      <div 
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent close on content click
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
            <h3 className={`text-xl font-bold ${textPrimary} mb-4`}>Report Details</h3>
            
            <div className="flex items-center justify-center gap-3 mb-6">
                 <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative">
                     <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold">
                        {report?.name?.charAt(0)}
                     </div>
                 </div>
                 <div className="text-left">
                     <p className="font-bold text-gray-900">{report?.name}</p>
                     <p className="text-xs text-gray-500">{report?.date}</p>
                 </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-left">
                <p className="text-sm font-semibold text-gray-700 mb-1">Reason:</p>
                <p className="text-gray-600 mb-4">{report?.reason}</p>
                
                <p className="text-sm font-semibold text-gray-700 mb-1">Description:</p>
                <p className="text-sm text-gray-600">{report?.description}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default function ReportPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  const [reportToDelete, setReportToDelete] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      
      {/* Header Section */}
      <div className={`${buttonbg} rounded-t-xl p-8`}>
        {/* Empty header block to match design height/style if needed, or just title container */}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden -mt-4 relative z-10">
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-white">
                    <TableRow className="border-b border-gray-100 hover:bg-transparent">
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary} pl-8`}>S.ID</TableHead>
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Report From</TableHead>
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Report Reason</TableHead>
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Date & Time</TableHead>
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary} text-right pr-8`}>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reportsData.map((item, i) => (
                        <TableRow key={i} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                             <TableCell className="font-medium text-gray-600 py-4 pl-8">{item.id}</TableCell>
                             <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                                         <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-500">
                                            {item.name.charAt(0)}
                                         </div>
                                    </div>
                                    <span className="font-medium text-gray-900">{item.name}</span>
                                </div>
                             </TableCell>
                             <TableCell className="text-gray-900 font-medium py-4">{item.reason}</TableCell>
                             <TableCell className="text-gray-900 font-medium py-4">{item.date}</TableCell>
                             <TableCell className="py-4 pr-8">
                                <div className="flex items-center justify-end gap-3">
                                    {/* Reply Action */}
                                    <button className={`text-[#58976B] hover:text-[#2E6F65] p-1 rounded-full hover:bg-green-50 transition-colors`}>
                                        <CornerUpLeft className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Delete Action */}
                                    <button 
                                         onClick={() => { setReportToDelete(item); setIsDeleteOpen(true); }}
                                         className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>

                                    {/* View Action */}
                                    <button 
                                        onClick={() => { setSelectedReport(item); setIsViewOpen(true); }}
                                        className={`text-[#58976B] hover:text-[#2E6F65] p-1 rounded-full hover:bg-green-50 transition-colors`}
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                             </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      </div>

       {/* Report Details Modal */}
       <ReportDetailModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} report={selectedReport} />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Report?</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete this report from <span className="font-bold text-gray-900">{reportToDelete?.name}</span>? This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setReportToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={() => { 
                        // Implement delete logic here
                        console.log("Deleting report from:", reportToDelete?.name); 
                        setIsDeleteOpen(false); 
                    }} 
                    className="bg-red-500 hover:bg-red-600 text-white"
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
