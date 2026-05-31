"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  initialData?: any;
}

export function PatientForm({ onSubmit, loading = false, initialData }: PatientFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    dateOfBirth: initialData?.dateOfBirth || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    notes: initialData?.notes || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Prénom"
          value={formData.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          required
        />
        <Input
          label="Nom"
          value={formData.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
        />
        <Input
          label="Téléphone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      <Input
        label="Date de naissance"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => handleChange("dateOfBirth", e.target.value)}
      />

      <Input
        label="Adresse"
        value={formData.address}
        onChange={(e) => handleChange("address", e.target.value)}
      />

      <Input
        label="Ville"
        value={formData.city}
        onChange={(e) => handleChange("city", e.target.value)}
      />

      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        rows={4}
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Enregistrement..." : "Enregistrer le patient"}
      </Button>
    </form>
  );
}
