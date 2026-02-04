import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../services/supabase";
import { api } from "@shared/routes";

export async function checkMobile(req: Request, res: Response) {
    try {
        const { mobile } = api.auth.checkMobile.input.parse(req.body);
        const { data: customer } = await supabase
            .from("customers")
            .select("id, pin, mobile_verified")
            .eq("mobile", mobile)
            .maybeSingle();

        if (!customer) {
            return res.json({ exists: false });
        }

        // If mobile exists but is a placeholder/unverified, tell frontend it needs registration
        if (customer.mobile_verified === false) {
            return res.json({
                exists: true,
                verified: false,
                message: "Mobile not registered. Please register it."
            });
        }

        res.json({
            exists: !!customer.pin,
            verified: true
        });
    } catch (error) {
        res.json({ exists: false });
    }
}

export async function setupPin(req: Request, res: Response) {
    try {
        const { mobile, pin } = api.auth.setupPin.input.parse(req.body);
        const hashedPin = await bcrypt.hash(pin, 10);

        const { data: existing } = await supabase
            .from("customers")
            .select("id, pin")
            .eq("mobile", mobile)
            .maybeSingle();

        let customerId: string;
        if (existing) {
            if (existing.pin) {
                return res.status(403).json({ message: "Account already exists. Please login." });
            }
            const { error } = await supabase.from("customers").update({ pin: hashedPin }).eq("mobile", mobile);
            if (error) throw error;
            customerId = existing.id;
        } else {
            const { data, error } = await supabase
                .from("customers")
                .insert({ mobile, name: "New Customer", pin: hashedPin, role: "user" })
                .select("id")
                .single();
            if (error) throw error;
            customerId = data.id;
        }

        const { data: user } = await supabase.from("customers").select("role").eq("id", customerId).single();
        const role = user?.role || "user";

        req.session.user = { mobile, id: customerId, role };
        await new Promise<void>((r) => req.session.save(() => r()));

        res.json({ success: true, session: req.session.user });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function loginPin(req: Request, res: Response) {
    try {
        const { mobile, pin } = api.auth.loginPin.input.parse(req.body);
        const { data: customer } = await supabase
            .from("customers")
            .select("*")
            .eq("mobile", mobile)
            .maybeSingle();

        if (!customer || !customer.pin) {
            return res.status(401).json({ message: "Mobile not registered" });
        }

        // Block login only if mobile is not verified
        if (customer.mobile_verified !== true) {
            return res.status(403).json({
                message: "Your mobile number is not registered. Please register it.",
                code: "MOBILE_UNVERIFIED"
            });
        }

        const valid = await bcrypt.compare(pin, customer.pin);
        if (!valid) return res.status(401).json({ message: "Incorrect PIN" });

        req.session.user = {
            mobile,
            id: customer.id,
            role: customer.role || "user",
            mobileVerified: true
        };
        await new Promise<void>((r) => req.session.save(() => r()));

        res.json({
            success: true,
            session: req.session.user
        });
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
}

export async function changePin(req: Request, res: Response) {
    try {
        const { oldPin, newPin } = api.auth.changePin.input.parse(req.body);
        const mobile = req.session.user!.mobile;

        const { data: customer } = await supabase.from("customers").select("pin").eq("mobile", mobile).single();
        if (!customer?.pin) return res.status(401).json({ message: "User not found" });

        const valid = await bcrypt.compare(oldPin, customer.pin);
        if (!valid) return res.status(401).json({ message: "Incorrect old PIN" });

        const hashedPin = await bcrypt.hash(newPin, 10);
        const { error } = await supabase.from("customers").update({ pin: hashedPin }).eq("mobile", mobile);
        if (error) throw error;

        res.json({ success: true });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}

export async function logout(req: Request, res: Response) {
    req.session.destroy(() => {
        res.clearCookie("saket.sid"); // Updated cookie name
        res.json({ success: true });
    });
}

export async function me(req: Request, res: Response) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json({ user: req.session.user || null });
}
