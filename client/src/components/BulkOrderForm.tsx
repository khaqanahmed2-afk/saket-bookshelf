
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShinyButton } from "./ui/shiny-button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

// Schema for validation
const formSchema = z.object({
    name: z.string().min(2, "Name is required"),
    organization: z.string().min(2, "Organization name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    email: z.string().email().optional().or(z.literal("")),
    orgType: z.string({ required_error: "Please select organization type" }),
    requirement: z.string().min(10, "Please describe your requirement"),
    quantity: z.string().optional(),
    deliveryDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function BulkOrderForm() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            organization: "",
            phone: "",
            email: "",
            requirement: "",
            quantity: "",
            deliveryDate: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (import.meta.env.DEV) console.log("Bulk Inquiry Submitted:", data);

        // Construct WhatsApp message with form data
        const message = `*New Bulk Order Inquiry*
    
👤 *Name:* ${data.name}
🏢 *Org:* ${data.organization} (${data.orgType})
📞 *Phone:* ${data.phone}
📧 *Email:* ${data.email || "N/A"}

📦 *Requirement:*
${data.requirement}

📊 *Qty:* ${data.quantity || "Not specified"}
📅 *Needed by:* ${data.deliveryDate || "ASAP"}`;

        const whatsappUrl = `https://wa.me/917754057200?text=${encodeURIComponent(message)}`;

        toast({
            title: "Inquiry Generated!",
            description: "Redirecting to WhatsApp to send your request...",
            variant: "default",
        });

        // Redirect to WhatsApp
        window.open(whatsappUrl, "_blank");

        setIsSubmitting(false);
        form.reset();
    };

    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-100">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Get Instant Bulk Quote</h3>
                <p className="text-slate-500 text-sm mt-1">Fill this form or WhatsApp us directly.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="10-digit mobile number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="organization"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Organization Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input placeholder="School / Office / Institute Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="orgType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization Type <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="School">School / College</SelectItem>
                                            <SelectItem value="Coaching">Coaching Institute</SelectItem>
                                            <SelectItem value="Office">Corporate Office</SelectItem>
                                            <SelectItem value="NGO">NGO / Non-Profit</SelectItem>
                                            <SelectItem value="Shop">Retail Shop (Reseller)</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expected Quantity</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Range" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="50-100">50 - 100 units</SelectItem>
                                            <SelectItem value="100-500">100 - 500 units</SelectItem>
                                            <SelectItem value="500-1000">500 - 1000 units</SelectItem>
                                            <SelectItem value="1000+">1000+ units</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="requirement"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Requirement Details <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="List products you need (e.g. 200 Notebooks, 500 Pens, 50 Files)"
                                        className="min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <ShinyButton
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white font-bold h-12 rounded-xl text-lg shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Send className="w-5 h-5" /> Get Wholesale Quote
                            </span>
                        )}
                    </ShinyButton>

                    <p className="text-xs text-center text-slate-400 mt-2">
                        * We will redirect you to WhatsApp to send this inquiry instantly.
                    </p>
                </form>
            </Form>
        </div>
    );
}
