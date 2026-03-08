"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Trash2, Camera, Upload } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buttonbg } from "@/contexts/theme";

// Mock Data for Existing Admins
const initialAdmins = [
  { id: 1, name: "Super Admin", email: "admin@example.com", role: "Super Admin", status: "Active" },
  { id: 2, name: "John Doe", email: "john.admin@example.com", role: "Admin", status: "Active" },
  { id: 3, name: "Jane Smith", email: "jane.admin@example.com", role: "Editor", status: "Inactive" },
  { id: 4, name: "Mike Manager", email: "mike@example.com", role: "Manager", status: "Active" },
  { id: 5, name: "Sarah Support", email: "sarah@example.com", role: "Support", status: "Active" },
];

export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null as string | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admins, setAdmins] = useState(initialAdmins);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        setIsSubmitting(false);
        return;
    }

    // Mock API call
    setTimeout(() => {
        setIsSubmitting(false);
        toast.success("New admin created successfully!");
        // Add new admin to the list mock
        const newAdmin = {
            id: Date.now(),
            name: formData.fullName,
            email: formData.email,
            role: "Admin",
            status: "Active"
        };
        setAdmins([...admins, newAdmin]);
        setAdmins([...admins, newAdmin]);
        setFormData({ fullName: "", email: "", password: "", confirmPassword: "", image: null });
    }, 1500);
  };

  const handleDelete = (id: number) => {
      if (confirm("Are you sure you want to delete this admin?")) {
          setAdmins(admins.filter(admin => admin.id !== id));
          toast.success("Admin deleted successfully");
      }
  };


  return (
    <div className="w-full mx-auto p-6 space-y-8">
      
      {/* Create Admin Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className={`${buttonbg} px-6 py-4 flex items-center gap-3`}>
            <ShieldCheck className="text-white w-6 h-6" />
            <h1 className="text-white text-xl font-bold ">Create New Admin</h1>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Image Upload */}
                <div className="flex justify-center mb-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-[#2E6F65] transition-colors">
                            {formData.image ? (
                                <Image src={formData.image} alt="Preview" fill className="object-cover" />
                            ) : (
                                <Camera className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#2E6F65] p-1.5 rounded-full text-white shadow-sm border border-white">
                            <Upload className="w-3 h-3" />
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                            id="fullName" 
                            placeholder="Enter full name" 
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="Enter email address" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input 
                                id="confirmPassword" 
                                type="password" 
                                placeholder="••••••••" 
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    variant="brand"
                    className="w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating..." : "Create Admin Account"}
                </Button>
            </form>
          </div>
      </div>

      {/* Existing Admins List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Existing Admins</h2>
          
          <div className="mb-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {admins.map((admin) => (
                        <TableRow key={admin.id}>
                            <TableCell className="font-medium">{admin.name}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="bg-gray-50">
                                    {admin.role}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge 
                                    className={
                                        admin.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                                        'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                    }
                                    variant="secondary"
                                >
                                    {admin.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(admin.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination >
            <PaginationContent>
                <PaginationItem className={` px-2 rounded-full py-2 flex items-center gap-3`}>
                <PaginationPrevious href="#" onClick={(e) => e.preventDefault()} />
                </PaginationItem>
                <PaginationItem>
                <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                <PaginationLink href="#" onClick={(e) => e.preventDefault()}>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                <PaginationLink href="#" onClick={(e) => e.preventDefault()}>3</PaginationLink>
                </PaginationItem>
                <PaginationItem className={` px-2 rounded-full py-2 flex items-center gap-3`}>
                <PaginationNext href="#" onClick={(e) => e.preventDefault()} />
                </PaginationItem>
            </PaginationContent>
          </Pagination>
      </div>

    </div>
  );
}
