"use client";

import { useState, useRef, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Trash2, 
  Edit, 
  Plus, 
  Store,
  Globe,
  Layers,
  CheckCircle2,
  X
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { buttonbg, textPrimary, borderPrimary } from "@/contexts/theme";

// Types
type Category = {
  id: string;
  name: string;
};

type SubCategory = {
  id: string;
  name: string;
  parentCategory: string;
};

type Provider = {
  id: string;
  name: string;
  features: string;
  url: string;
  status: "Active" | "Inactive";
};

type Benefit = {
  id: string;
  title: string;
  description: string;
};

// Mock Data
const initialCategories: Category[] = [
  { id: "01", name: "Air Condition" },
  { id: "01", name: "Electric Work" },
  { id: "01", name: "Siding repair" },
];

const initialSubCategories: SubCategory[] = [
  { id: "01", name: "Air Condition", parentCategory: "Restaurant" },
  { id: "01", name: "Electric Work", parentCategory: "Recursion" },
  { id: "01", name: "Siding repair", parentCategory: "Event" },
];

export default function CategoryPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // State
  const [view, setView] = useState<"categories" | "sub-categories">("categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal Form State (Mocked)
  const [subCategoryName, setSubCategoryName] = useState("eSim Page");
  const [benefits, setBenefits] = useState<Benefit[]>([
    { id: "1", title: "Instant Activation", description: "Activate your data plan in minutes, right from your phone. No waiting for delivery." },
    { id: "2", title: "Cost Effective", description: "Save on expensive roaming fees with affordable local and regional data plans." },
    { id: "3", title: "Global Coverage", description: "Access data in over 190 countries with one simple solution." },
  ]);
  const [providers, setProviders] = useState<Provider[]>([
    { id: "1", name: "Airalo World", features: "10GB-20GB", url: "http://api...", status: "Active" },
    { id: "2", name: "Holafly", features: "Unlimited Data", url: "http://api...", status: "Active" },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const addBenefit = () => {
    setBenefits([...benefits, { id: Date.now().toString(), title: "New Benefit", description: "Description here" }]);
  };

  const removeBenefit = (id: string) => {
    setBenefits(benefits.filter(b => b.id !== id));
  };

  const addProvider = () => {
    setProviders([...providers, { id: Date.now().toString(), name: "New Provider", features: "", url: "", status: "Active" }]);
  };

  const removeProvider = (id: string) => {
    setProviders(providers.filter(p => p.id !== id));
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <h3 className="text-3xl font-bold text-gray-900">156K</h3>
                <p className="text-gray-500 font-medium mt-1">Countries</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#2E6F65]">
                <Globe className="w-6 h-6" />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <h3 className="text-3xl font-bold text-gray-900">156,234</h3>
                <p className="text-gray-500 font-medium mt-1">Categories</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#2E6F65]">
                <Layers className="w-6 h-6" />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <h3 className="text-3xl font-bold text-gray-900">47</h3>
                <p className="text-gray-500 font-medium mt-1">Sub Categories</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#2E6F65]">
                <Store className="w-6 h-6" />
            </div>
        </div>
      </div>

      {/* Header */}
      <div className={`${buttonbg} rounded-t-xl p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4`}>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto"> 
              
              <div className="bg-white rounded-lg p-1 flex items-center gap-1">
                 <button 
                    onClick={() => setView("categories")}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${view === "categories" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                 >
                    Categories
                 </button>
                 <button 
                    onClick={() => setView("sub-categories")}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${view === "sub-categories" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                 >
                    Sub Categories
                 </button>
              </div>
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-[#2E6F65] hover:bg-white/90 font-bold w-full md:w-auto"
          >
              +Add {view === "categories" ? "Categories" : "Sub Categories"}
          </Button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden -mt-4 relative z-10 min-h-[500px] flex flex-col justify-between">
         {view === "categories" ? (
             <>
             <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-white">
                        <TableRow className="border-b border-[#2E6F65] hover:bg-transparent">
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary} pl-6`}>S.ID</TableHead>
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Category Name</TableHead>
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary} text-right pr-6`}>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialCategories.map((cat, i) => (
                            <TableRow key={i} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                                <TableCell className="font-medium text-gray-600 py-4 pl-6">{cat.id}</TableCell>
                                <TableCell className="text-gray-900 font-medium py-4">{cat.name}</TableCell>
                                <TableCell className="py-4 pr-6">
                                    <div className="flex items-center justify-end gap-3">
                                        <button className="text-red-500 hover:text-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button className="text-gray-800 hover:text-black transition-colors">
                                            <Edit className="w-5 h-5" />
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
                        <PaginationItem><PaginationNext href="#" className="text-gray-500 hover:text-[#2E6F65]" /></PaginationItem>
                    </PaginationContent>
                </Pagination>
             </div>
             </>
         ) : (
             <>
             <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-white">
                        <TableRow className="border-b border-[#2E6F65] hover:bg-transparent">
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary} pl-6`}>S.ID</TableHead>
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Sub Category Name</TableHead>
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Category of</TableHead>
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary} text-right pr-6`}>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialSubCategories.map((sub, i) => (
                            <TableRow key={i} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                                <TableCell className="font-medium text-gray-600 py-4 pl-6">{sub.id}</TableCell>
                                <TableCell className="text-gray-900 font-medium py-4">{sub.name}</TableCell>
                                <TableCell className="text-gray-600 py-4">{sub.parentCategory}</TableCell>
                                <TableCell className="py-4 pr-6">
                                    <div className="flex items-center justify-end gap-3">
                                        <button className="text-red-500 hover:text-red-600 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => setIsModalOpen(true)}
                                            className="text-gray-800 hover:text-black transition-colors"
                                        >
                                            <Edit className="w-5 h-5" />
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
                        <PaginationItem><PaginationNext href="#" className="text-gray-500 hover:text-[#2E6F65]" /></PaginationItem>
                    </PaginationContent>
                </Pagination>
             </div>
             </>
         )}
      </div>

      {/* Sub-Category/Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-gray-50 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col my-8 animate-in fade-in zoom-in duration-200">
                
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    <h2 className={`text-2xl font-bold ${textPrimary} text-center`}>
                        {view === "categories" ? "Add Category" : "Sub Category Details"}
                    </h2>

                    {view === "sub-categories" ? (
                        <>
                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                            <h3 className="font-bold text-gray-800">Basic Info</h3>
                            <div className="space-y-2">
                                <Label>Sub Categories Name</Label>
                                <Input value={subCategoryName} onChange={(e) => setSubCategoryName(e.target.value)} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                             <h3 className="font-bold text-gray-800">Data Plan Explanation</h3>
                             <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Faq</Label>
                                    <Textarea placeholder="FAQ contents..." className="min-h-[100px]" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Why Travelers Love eSIMs</Label>
                                    <Textarea placeholder="Explanation..." className="min-h-[100px]" />
                                </div>
                             </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-800">Key benefits and features list</h3>
                                <Button onClick={addBenefit} variant="outline" className="h-8 gap-1 text-green-600 bg-green-50 border-green-100 border-0 hover:bg-green-100">+ Add Benefit</Button>
                            </div>
                            <div className="space-y-4">
                                {benefits.map((benefit, i) => (
                                    <div key={benefit.id} className="p-4 border border-gray-100 rounded-lg flex gap-4 items-start bg-gray-50/50">
                                         <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 font-bold">
                                             {i + 1}
                                         </div>
                                         <div className="space-y-3 flex-1">
                                             <Input placeholder="Benefit Title" defaultValue={benefit.title} className="bg-white" />
                                             <Textarea placeholder="Benefit Description" defaultValue={benefit.description} className="bg-white min-h-[60px]" />
                                         </div>
                                         <button onClick={() => removeBenefit(benefit.id)} className="text-red-400 hover:text-red-600 p-1">
                                              <Trash2 className="w-4 h-4" />
                                         </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-800">eSIM Providers / Offers</h3>
                                <Button onClick={addProvider} variant="outline" className="h-8 gap-1 text-blue-600 bg-blue-50 border-blue-100 border-0 hover:bg-blue-100">+ Add Provider</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Provider</TableHead>
                                            <TableHead>Features</TableHead>
                                            <TableHead>CTA url</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {providers.map((provider) => (
                                            <TableRow key={provider.id}>
                                                <TableCell><Input defaultValue={provider.name} className="h-8" /></TableCell>
                                                <TableCell><Input defaultValue={provider.features} className="h-8" /></TableCell>
                                                <TableCell><Input defaultValue={provider.url} className="h-8" /></TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {provider.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <button onClick={() => removeProvider(provider.id)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        </>
                    ) : (
                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                             <div className="space-y-2">
                                <Label>Category Name</Label>
                                <Input placeholder="Enter category name" />
                             </div>
                        </div>
                    )}

                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-6 pt-2 border-t border-gray-100 bg-gray-50 rounded-b-xl sticky bottom-0">
                     <Button 
                        onClick={() => setIsModalOpen(false)}
                        variant="outline" 
                        className={`w-full sm:flex-1 h-11 border-[#2E6F65] ${textPrimary} hover:bg-green-50 font-semibold`}
                    >
                        Cancel
                     </Button>
                     <Button 
                         className={`w-full sm:flex-1 h-11 ${buttonbg} font-semibold`}
                         onClick={() => {
                             setIsModalOpen(false);
                             // Handle save logic
                         }}
                     >
                        Save Changes
                     </Button>
                </div>

            </div>
        </div>
      )}

    </div>
  );
}
