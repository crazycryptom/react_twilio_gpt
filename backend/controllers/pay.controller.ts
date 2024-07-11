import * as dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
import Stripe from 'stripe';
import sendError from './assets/error.controller';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const domain = "http://localhost:3000";

interface portalSessionProps {
    customer: string;
    return_url: string;
}


export const createSubscription = async (req: Request, res: Response) => {
    try {
        const { name, email, paymentMethod, priceId } = req.body;

        // create a stripe customer
        const customer = await stripe.customers.create({
            name,
            email,
            payment_method: paymentMethod,
            invoice_settings: {
                default_payment_method: paymentMethod,
            },
        });

        //create stripe subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: {
                payment_method_options: {
                    card: {
                        request_three_d_secure: 'any',
                    },
                },
                payment_method_types: ['card'],
                save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
        });

        const invoice = subscription.latest_invoice as Stripe.Invoice;
        const intent = invoice.payment_intent as Stripe.PaymentIntent;
        res.status(200).json({
            subscriptionId: subscription.id,
            clientSecret: intent.client_secret,
        });
    } catch (err) {
        sendError(err, 404, req, res);
    }
}

export const createCheckoutSession = async (req: Request, res: Response) => {
    const prices = await stripe.prices.list({
        lookup_keys: [req.body.lookup_key],
        expand: ['data.product'],
    });

    const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [
            {
                price: prices.data[0].id,
                // For metered billing, do not pass quantity
                quantity: 1,

            },
        ],
        mode: 'subscription',
        success_url: `${domain}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${domain}?canceled=true`,
    });

    res.redirect(303, session.url as string);
};

export const createPortalSession = async (req: Request, res: Response) => {
    // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    // Typically this is stored alongside the authenticated user in your database.
    const { session_id } = req.body;
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    // This is the url to which the customer will be redirected when they are done
    // managing their billing with the portal.
    const returnUrl = domain;
    
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: checkoutSession.customer,
        return_url: returnUrl,
    } as portalSessionProps);

    res.redirect(303, portalSession.url);
}

