"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Trash2, Edit, Eye, FileText } from "lucide-react";
import { buttonbg, textPrimary } from "@/contexts/theme";

// Mock Data
const contents = [
  { id: "01", title: "Why Travelers Love eSIMs", category: "Travel", author: "Admin", date: "2024-03-15", status: "Published" },
  { id: "02", title: "Top 10 Destinations 2024", category: "Guides", author: "Admin", date: "2024-03-14", status: "Published" },
  { id: "03", title: "How to Activate eSIM", category: "Tutorial", author: "Admin", date: "2024-03-10", status: "Draft" },
  { id: "04", title: "Roaming Fees Explained", category: "Informative", author: "Admin", date: "2024-03-08", status: "Published" },
];

export default function ContentsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

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
      
      {/* Header */}
      <div className={`${buttonbg} rounded-xl p-4 px-6 shadow-sm flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-white" />
            <h1 className="text-2xl font-bold text-white">Content Management</h1>
          </div>
          <Button className="bg-white text-[#2E6F65] hover:bg-white/90 font-bold">
              + Add New Content
          </Button>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col justify-between">
         <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-white">
                    <TableRow className="border-b border-[#2E6F65] hover:bg-transparent">
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary} pl-6`}>S.ID</TableHead>
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Title</TableHead>
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Category</TableHead>
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Author</TableHead>
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Date</TableHead>
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Status</TableHead>
                        <TableHead className={`font-semibold text-base py-5 ${textPrimary} text-right pr-6`}>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contents.map((item, i) => (
                        <TableRow key={i} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                            <TableCell className="font-medium text-gray-600 py-4 pl-6">{item.id}</TableCell>
                            <TableCell className="text-gray-900 font-medium py-4">{item.title}</TableCell>
                            <TableCell className="text-gray-600 py-4">{item.category}</TableCell>
                            <TableCell className="text-gray-600 py-4">{item.author}</TableCell>
                            <TableCell className="text-gray-600 py-4">{item.date}</TableCell>
                            <TableCell className="py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                    ${item.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {item.status}
                                </span>
                            </TableCell>
                            <TableCell className="py-4 pr-6">
                                <div className="flex items-center justify-end gap-3">
                                    <button className="text-gray-500 hover:text-gray-700 transition-colors">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button className="text-gray-800 hover:text-black transition-colors">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button className="text-red-500 hover:text-red-600 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
         </div>

         {/* Pagination */}
          <div className="p-4 border-t border-gray-100">
            <Pagination>
                <PaginationContent>
                    <PaginationItem><PaginationPrevious href="#" className="text-gray-500 hover:text-[#2E6F65]" /></PaginationItem>
                    <PaginationItem><PaginationLink href="#" isActive className="bg-[#2E6F65] text-white hover:bg-[#2E6F65]/90 hover:text-white border-0">1</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationLink href="#" className="text-gray-600 hover:text-[#2E6F65] hover:bg-gray-100 border-0">2</PaginationLink></PaginationItem>
                    <PaginationItem><PaginationNext href="#" className="text-gray-500 hover:text-[#2E6F65]" /></PaginationItem>
                </PaginationContent>
            </Pagination>
          </div>
      </div>

    </div>
  );
}
