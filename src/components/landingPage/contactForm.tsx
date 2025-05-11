"use client";
import { useState, FormEvent, ChangeEvent } from "react";
import Image from "next/image";

interface FormData {
  email: string;
  message: string;
}

interface FormErrors {
  email?: string;
  message?: string;
}

interface SubmitStatus {
  success: boolean;
  message: string;
}

export default function ContactForm() {
    const [formData, setFormData] = useState<FormData>({
        email: "",
        message: ""
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        // Email validation
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        
        // Message validation
        if (!formData.message) {
            newErrors.message = "Message is required";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        setSubmitStatus(null);
        
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    to: "sreenand6@gmail.com"
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setSubmitStatus({ success: true, message: "Message sent successfully!" });
                // Reset form
                setFormData({ email: "", message: "" });
            } else {
                setSubmitStatus({ success: false, message: data.message || "Failed to send message. Please try again." });
            }
        } catch (error) {
            setSubmitStatus({ success: false, message: "An error occurred. Please try again later." });
            console.error("Form submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="contact" className="w-full min-h-fit bg-[var(--linen)] flex flex-col p-20">
            <h1 className="text-5xl text-[var(--taupe)]">Let's talk</h1>
            <p className="font-sans mb-2 text-lg">We'd love to hear from you</p>
            
            <form className="flex flex-col" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <input 
                        type="email" 
                        name="email"
                        placeholder="Email" 
                        className={`w-full md:w-1/2 h-12 px-4 rounded-lg border-2 ${errors.email ? 'border-red-500' : 'border-[var(--taupe)]'} text-xl font-sans`}
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <p className="text-red-500 mt-1 font-sans">{errors.email}</p>}
                </div>
                
                <div className="mb-4">
                    <textarea 
                        name="message"
                        placeholder="Message" 
                        className={`w-full md:w-1/2 h-60 rounded-lg border-2 ${errors.message ? 'border-red-500' : 'border-[var(--taupe)]'} text-xl font-sans p-5`}
                        value={formData.message}
                        onChange={handleChange}
                    />
                    {errors.message && <p className="text-red-500 font-sans mt-1">{errors.message}</p>}
                </div>

                {/* submit message */}
                {submitStatus && (
                    <div className={`mb-4 font-sans rounded-lg ${submitStatus.success ? 'text-green-800' : 'text-red-800'}`}>
                        {submitStatus.message}
                    </div>
                )}

                {/* submit button */}
                <button 
                    type="submit"
                    className="bg-[var(--taupe)] text-white w-40 h-12 rounded-full flex items-center justify-center"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <p className="text-2xl">Sending...</p>
                    ) : (
                        <p className="text-2xl">Send</p>
                    )}
                </button>
            </form>
        </div>
    );
}