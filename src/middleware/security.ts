import { ArcjetNodeRequest, slidingWindow } from "@arcjet/node";
import type {Request, Response, NextFunction } from "express";
import aj from "../config/arcject";

const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    
    if(process.env.NODE_ENV === "test") return next();

    try{
        // Arcjet shields can deny requests when Origin is missing or literally "null" (some tools/extensions).
        // Skip Arcjet for those cases to avoid false 403s on server-to-server or local tools.
        const originHeader = req.headers.origin;
        if (!originHeader || originHeader === 'null') {
            return next();
        }

        const role: RateLimitRole = req.user?.role || "guest";

        let limit: number;
        let message: string;

        switch(role){
            case "admin":
                limit = 20;
                message = "Admins are limited to 20 requests per 2 seconds.";
                break;     
            case "teacher":
                limit = 10;
                message = "Teachers are limited to 10 requests per 2 seconds.";
                break;
            case "student":
                limit = 10;
                message = "Students are limited to 10 requests per 2 seconds.";
                break;
            default:
                limit = 2;
                message = "Guests are limited to 2 requests per 2 seconds.";
        }

        const client = aj.withRule(
            slidingWindow({
                mode: "LIVE",
                interval: '1m', 
                max: limit,
            })
        )

        const arcjetRequest: ArcjetNodeRequest = {
            headers: req.headers,
            method: req.method,
            url: req.originalUrl ?? req.url,
            socket: { remoteAddress: req.socket.remoteAddress ?? req.ip ?? '0.0.0.0' },
        }

        const decision = await client.protect(arcjetRequest);

        if(decision.isDenied() && decision.reason.isBot()){
            return res.status(403).json({error: 'Forbidden', message: 'Automated requests are not allowed.' });
        }

        if(decision.isDenied() && decision.reason.isShield()){
            return res.status(403).json({error: 'Forbidden', message: 'Shield protection is active.' });
        }
        if(decision.isDenied() && decision.reason.isRateLimit()){
            return res.status(429).json({error: 'Rate limit exceeded', message: message});
        }

        next();

    }catch(err){
        console.error("Arcjet error:", err);
        res.status(500).json({error: 'Internal server error', message: "Something went wrong with security middleware" });
    }

};


export default securityMiddleware;