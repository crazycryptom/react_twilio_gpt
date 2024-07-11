import { Request, Response } from 'express';
import sendError from './error.controller';
import APIFeatures from './../../utils/apiFeatures';

export const deleteOne = (Model: any) => async (req: Request, res: Response) => {
    try {
        
        await Model.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch(err) {
        sendError(err, 404, req, res);
    }
};

export const updateOne = (Model: any) => async (req: Request, res: Response) => {
    try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidator: true
        });
        if (!doc) {
            throw new Error('No document found with that ID');
        }

        res.status(200).json({
            status: 'success',
            data: doc
        });
    } catch(err) {
        sendError(err, 404, req, res);
    }
};

export const createOne = (Model: any) => async (req: Request, res: Response) => {
    try {
        
        if (!req.body.createdAt) {
            req.body.createdAt = new Date().toISOString();
        }
        const newDoc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: newDoc
        });
    } catch(err) {
        sendError(err, 400, req, res);
    }
};

export const getOne = (Model: any, ...populateQuery: any[]) => async (req: Request, res: Response) => {
    try {
        let query = Model.findById(req.params.id);
        if (populateQuery.length > 0 ) {
            populateQuery.map(el => query.populate(el));
        }
        const doc = await query;

        if (!doc) {
            throw new Error('No document found with this ID');
        }

        res.status(200).json({
            status: 'success',
            data: doc
        });
    } catch(err) {
        sendError(err, 404, req, res);
    }
}

export const getAll = (Model: any) => async (req: Request, res: Response) => {
    try {
       
        const data = await APIFeatures(Model, req.query);
        const total = await Model.countDocuments({});

        res.status(200).json({
            status: 'success',
            data,
            total
        });
    } catch(err) {
        sendError(err, 404, req, res);
    }
};