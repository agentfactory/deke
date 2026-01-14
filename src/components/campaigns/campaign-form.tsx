"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

const campaignFormSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  location: z.string().min(3, "Location is required"),
  radiusMiles: z.number().min(50).max(200),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  serviceType: z.enum([
    "COACHING",
    "WORKSHOPS",
    "MASTERCLASS",
    "ARRANGEMENTS",
    "SPEAKING",
  ]),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type CampaignFormValues = z.infer<typeof campaignFormSchema>;

interface CampaignFormProps {
  onSubmit: (values: CampaignFormValues, isDraft: boolean) => void;
  initialValues?: Partial<CampaignFormValues>;
  isLoading?: boolean;
}

export function CampaignForm({
  onSubmit,
  initialValues,
  isLoading = false,
}: CampaignFormProps) {
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: initialValues?.name || "",
      location: initialValues?.location || "",
      radiusMiles: initialValues?.radiusMiles || 100,
      startDate: initialValues?.startDate || "",
      endDate: initialValues?.endDate || "",
      serviceType: initialValues?.serviceType || "COACHING",
    },
  });

  const handleSubmit = (isDraft: boolean) => {
    return form.handleSubmit((values) => onSubmit(values, isDraft));
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Spring 2025 Vocal Workshop Tour"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Give your campaign a descriptive name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., San Francisco, CA or 94102"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Enter city, state, or zip code for the campaign center
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="radiusMiles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search Radius: {field.value} miles</FormLabel>
              <FormControl>
                <Slider
                  min={50}
                  max={200}
                  step={10}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                  disabled={isLoading}
                  className="py-4"
                />
              </FormControl>
              <FormDescription>
                Set the radius for discovering potential clients
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="COACHING">Coaching</SelectItem>
                  <SelectItem value="WORKSHOPS">Workshops</SelectItem>
                  <SelectItem value="MASTERCLASS">Masterclass</SelectItem>
                  <SelectItem value="ARRANGEMENTS">Arrangements</SelectItem>
                  <SelectItem value="SPEAKING">Speaking</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                What service are you promoting with this campaign?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit(true)}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Draft"
            )}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(false)}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create & Discover Leads"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
