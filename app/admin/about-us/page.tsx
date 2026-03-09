"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Save,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { buttonbg } from "@/contexts/theme";
import aboutUsApi from "@/redux/Api/settings/aboutUsApi";

export default function AboutUsPage() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching about data...");
        const response = await aboutUsApi.getAbout();
        console.log("API response:", response);
        console.log("Response success:", response.success);
        console.log("Response data:", response.data);
        console.log("About us content:", response.data?.aboutUs);

        if (response.success) {
          const aboutContent = response.data.aboutUs || "";
          console.log("Setting content to:", aboutContent);
          setContent(aboutContent);
        } else {
          console.log("API failed:", response);
          toast.error("Failed to load about us content");
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
        toast.error(error.message || "Failed to load about us content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please enter about us content");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = { aboutUs: content };
      const response = await aboutUsApi.createAbout(payload);

      if (response.success) {
        toast.success("About Us updated successfully!");
        setContent(content); // Update with the saved content
      } else {
        toast.error(response.message || "Failed to update about us");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update about us");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatting functions
  const insertText = (before: string, after: string = "") => {
    const textarea = document.getElementById(
      "about-textarea",
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    setContent(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length,
      );
    }, 0);
  };

  const formatBold = () => insertText("**", "**");
  const formatItalic = () => insertText("*", "*");
  const formatBulletList = () => insertText("\n• ", "");
  const formatNumberedList = () => insertText("\n1. ", "");
  const formatQuote = () => insertText("\n> ", "");
  const formatCode = () => insertText("`", "`");
  const formatLink = () => insertText("[", "](url)");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <div
        className={`${buttonbg} px-6 py-4 rounded-xl mb-6 flex items-center gap-3 shadow-md shadow-blue-200`}
      >
        <button
          onClick={() => router.back()}
          className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white text-xl sm:text-2xl font-bold">About Us</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>

        {/* Formatting Toolbar */}
        <div className="border border-gray-200 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1 border-b-0 mb-0">
          <button
            type="button"
            onClick={formatBold}
            className="h-8 px-2 hover:bg-gray-200 transition-colors rounded flex items-center justify-center"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={formatItalic}
            className="h-8 px-2 hover:bg-gray-200 transition-colors rounded flex items-center justify-center"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={formatBulletList}
            className="h-8 px-2 hover:bg-gray-200 transition-colors rounded flex items-center justify-center"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={formatNumberedList}
            className="h-8 px-2 hover:bg-gray-200 transition-colors rounded flex items-center justify-center"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={formatQuote}
            className="h-8 px-2 hover:bg-gray-200 transition-colors rounded flex items-center justify-center"
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={formatCode}
            className="h-8 px-2 hover:bg-gray-200 transition-colors rounded flex items-center justify-center"
            title="Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={formatLink}
            className="h-8 px-2 hover:bg-gray-200 transition-colors rounded flex items-center justify-center"
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Using simple textarea as placeholder for Jodit Editor to avoid large dependency install */}
        <textarea
          id="about-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-100 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y font-mono text-sm rounded-t-none"
          placeholder="Enter your about us content here..."
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-blue-700 text-sm font-medium mb-2">
            Formatting Guide:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-600 text-xs">
            <div>• **Bold** - Bold text</div>
            <div>• *Italic* - Italic text</div>
            <div>• • Item - Bullet list</div>
            <div>• 1. Item - Numbered list</div>
            <div>• &gt; Quote - Blockquote</div>
            <div>• `Code` - Inline code</div>
            <div>• [Text](url) - Links</div>
            <div>• Use line breaks for paragraphs</div>
          </div>
        </div>
      </div>

      <div className="text-center pb-10">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`${buttonbg} hover:bg-blue-700 text-white font-semibold w-full md:w-auto md:px-12 py-3 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto shadow-lg shadow-blue-600/20`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
