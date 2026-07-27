"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface CheckoutFormProps {
  defaultEmail: string;
  defaultName: string;
}

export function CheckoutForm({ defaultEmail, defaultName }: CheckoutFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: defaultName,
    email: defaultEmail,
    phone: "",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "PT",
  });

  const createOrder = trpc.order.createFromCart.useMutation({
    onSuccess: (order) => {
      toast({ title: "Encomenda criada com sucesso.", variant: "success" });
      router.push(`/account/orders/${order.id}`);
    },
    onError: (error) => {
      toast({ title: error.message || "Erro ao criar a encomenda", variant: "error" });
    },
  });

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder.mutate({
      email: form.email,
      phone: form.phone || undefined,
      shipping: {
        name: form.name,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        postalCode: form.postalCode,
        country: form.country,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 space-y-5">
      <h2 className="text-lg font-semibold text-foreground">Dados de Envio</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={handleChange("name")}
            placeholder="O teu nome completo"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange("email")}
            placeholder="teu@email.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Telefone (opcional)</Label>
        <Input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange("phone")}
          placeholder="+351 900 000 000"
        />
      </div>

      <div>
        <Label htmlFor="line1">Morada</Label>
        <Input
          id="line1"
          required
          value={form.line1}
          onChange={handleChange("line1")}
          placeholder="Rua, número"
        />
      </div>

      <div>
        <Label htmlFor="line2">Morada (linha 2, opcional)</Label>
        <Input
          id="line2"
          value={form.line2}
          onChange={handleChange("line2")}
          placeholder="Andar, apartamento, referência"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            required
            value={form.city}
            onChange={handleChange("city")}
            placeholder="Lisboa"
          />
        </div>

        <div>
          <Label htmlFor="postalCode">Código postal</Label>
          <Input
            id="postalCode"
            required
            value={form.postalCode}
            onChange={handleChange("postalCode")}
            placeholder="1000-001"
          />
        </div>

        <div>
          <Label htmlFor="country">País</Label>
          <Select
            id="country"
            required
            value={form.country}
            onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
          >
            <option value="PT">Portugal</option>
            <option value="ES">Espanha</option>
            <option value="FR">França</option>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={createOrder.isPending}>
        {createOrder.isPending ? "A criar encomenda…" : "Confirmar Encomenda"}
      </Button>
    </form>
  );
}
