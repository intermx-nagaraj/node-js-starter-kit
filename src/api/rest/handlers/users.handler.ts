import {Service} from "typedi";
import {NextFunction, Request, Response} from "express";

import {UsersService} from "../../../services";
import * as common from "../../../common";

@Service()
export class UsersHandler {

    constructor(
        private usersService: UsersService
    ) {
    }

    getUsersAPIHandler() {
        return async (req: Request, res: Response) => {
            const users = await this.usersService.getUsers();
            const response = common.formatSuccessMessage({
                msg: 'Success',
                data: users,
                sessionToken: 'Auth Token'
            });

            res.status(200).send(response);

        }
    }

    signUpAPIHandler() {
        return async (req: Request, res: Response) => {
            const payload = req.body;
            try {
                if (payload) {

                    const result: any = await this.usersService.registerUser(payload);
                    const response = common.formatSuccessMessage({
                        msg: 'Success',
                        data: {},
                        sessionToken: 'Auth Token'
                    });
                    console.log("response", response);
                    console.log('success', result);
                    if (result?.isSuccess) {
                        res.status(202).send(response);
                        return
                    }

                    response.status.code = 400;
                    response.status.message = result?.message;

                    res.status(200).send(response);

                }
            } catch (e) {
                console.log('Exception', e)
                const errorResponse = common.formatErrorMessage({msg: 'Something happend in the server', code: 500});
                res.status(400).send(errorResponse);
            }

        }
    }

    signInAPIHandler() {
        return async (req: Request, res: Response) => {
            const result = await this.usersService.login(req.body);
            if(result.error){
                res.status(400).send({error: result.error});
                return
            }
            if(!!req.session)req.session.userId = result._id;
            res.status(201).send(result);
        }
    }

    forgetPasswordAPIHandler() {
        return async (req: Request, res: Response) => {
            res.status(200).send(await this.usersService.getUsers());
        }
    }

    resetPasswordAPIHandler() {
        return async (req: Request, res: Response) => {
            res.status(200).send(await this.usersService.getUsers());
        }
    }

    logoutAPIHandler() {
        return async (req: Request, res: Response, next: NextFunction)=> {
            if (req.session) {
                // delete session object
                const sessionId = req.session.userId;
                const self = this;
                req.session.destroy(function (err) {
                    if (err) {
                        return res.status(400).send({error: 'Something went wrong', message: 'Could not able to logout'});
                    } else {
                        self.usersService.logout(sessionId);
                        return res.status(200).send({error: '', message: 'Success'});
                    }
                });
            }
        }
    }

}
