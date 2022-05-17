import React, { useEffect, useState } from 'react';
import { instance } from '../../axios';
import { AppComponentProps } from '../../components/Route';
import { environment } from '../../environments/environment';
import { IonLabel, IonContent, IonButton, useIonToast } from '@ionic/react';
import { Backdrop, CircularProgress, Grid } from '@material-ui/core';
import './ManageServer.scss';
import BgImage from '../../images/logo-transparent.png';
import { useHistory, useLocation } from 'react-router';
import Loader from '../../components/Loader';

interface Server {
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: string;
    features: [];
}

const ManageServer: React.FC<AppComponentProps> = () => {
    let history = useHistory();
    /**
     * States & Variables
     */
    const [isMobile, setIsMobile] = useState(false);
    const [servers, setServers] = useState<Server[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [present, dismiss] = useIonToast();

    /**
     * Use Effects
     */
    useEffect(() => {
        if(!localStorage.getItem('role')){
            history.push('/')
            return
        }

        if (window.innerWidth < 525) {
            setIsMobile(true);
        }
    }, [window.innerWidth]);

    useEffect(() => {
        let serverList: any = localStorage.getItem('servers');
        console.log('serverList', JSON.parse(serverList));
        if (serverList) {
            setServers(JSON.parse(serverList));
        }
    }, []);

    // when they click "Go"
    let storeGuild = (server: Server) => {

        setIsLoading(true);

        instance
            .post(
                `/guilds/${server.id}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
            .then(({ data }) => {
                history.push({
                    pathname: '/servermodule',
                    state: { server: server },
                });
            })
            .catch((error:any) => {
                console.log('error', error);

                let msg = '';
                if (error && error.response) {
                    msg = String(error.response.data.message);
                } else {
                    msg = 'Unable to connect. Please try again later';
                }

                present({
                    message: msg,
                    color: 'danger',
                    duration: 5000,
                    buttons: [{ text: 'X', handler: () => dismiss() }],
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // TODO: need explanation of all this...

    return (
        <>
            <Backdrop
                style={{
                    color: '#fff',
                    zIndex: 1000,
                }}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            {/*  */}
            <IonLabel className="text-5xl font-semibold justify-center flex">
                Select a Server to add the SOL Decoder bot to
            </IonLabel>

            <div className="m-3 relative bg-red-100 p-4 rounded-xl">
                <span className="text-lg text-red-700 font-medium">
                    <b>Note this page is only for server owners, for the time being. Also your server will need to first have our Discord Bot invited to it. Click one of the below links, then in the "Add to Server" on the bottom, select your server. Then click "Continue", then "Authorize"</b>
                    <br/>

                    <p>
                        - If using just the "Daily Mints" bots, <a className="underline cursor-pointer" href="https://discord.com/api/oauth2/authorize?client_id=927008889092857898&permissions=2048&redirect_uri=https%3A%2F%2Fsoldecoder.app%2Fmanageserver&response_type=code&scope=identify%20guilds%20guilds.members.read%20bot">click here</a> to add the Discord Bot to your server
                        <br/>
                        - Or if using the "Fox Token" bots (where users can type /token), this needs additional permissions so <a className="underline cursor-pointer" href="https://discord.com/oauth2/authorize?client_id=927008889092857898&permissions=2048&redirect_uri=https%3A%2F%2Fsoldecoder.app%2Fmanageserver&response_type=code&scope=identify%20guilds%20applications.commands%20bot%20guilds.members.read">click here</a> to add the Discord Bot to your server
                    </p>

                </span>
                <span className="absolute bg-red-500 w-8 h-8 flex items-center justify-center font-bold text-green-50 rounded-full -top-2 -left-2">
                    !
                </span>
            </div>

            <div className="flex flex-row justify-center w-full mt-8">
                <Grid
                    container
                    spacing={4}
                    className="flex justify-self-center "
                >
                    {servers ? servers.map((server: Server, index: number) => {
                        if (server.owner) {
                            return (
                                <Grid item xs={12} md={6} xl={4} key={index}>
                                    <div
                                        className="bg-image-wrapper"
                                        style={{
                                            backgroundImage: server.icon
                                                ? `url(https://cdn.discordapp.com/icons/${server.id}/${server.icon}.webp)`
                                                : '',
                                        }}
                                    >
                                        <div className="server-profile-bg">
                                            {/*server-logo-wrapper*/}
                                            <div className="">
                                                <img
                                                    src={
                                                        server.icon
                                                            ? `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.webp`
                                                            : ''
                                                    }
                                                    alt=""
                                                    className="server-profile-img"
                                                ></img>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-between w-full mt-4">
                                        <div className="flex flex-col justify-between">
                                            <span className="font-bold text-xl tracking-wider">
                                                {server.name}
                                            </span>
                                            <span className="mt-2 text-slate-500">
                                                {/*TODO*/}
                                                {/*user role*/}
                                            </span>
                                        </div>
                                        <div>
                                            <IonButton
                                                className="h-14 w-24 text-lg"
                                                onClick={() => {
                                                    storeGuild(server);
                                                }}
                                            >
                                                Go
                                            </IonButton>
                                        </div>
                                    </div>
                                </Grid>
                            );
                        }
                    }) : 'Unable to find any servers you are the owner of. For now this will only work for server owners - later you may use your NFTs to set this up for a server owner. If you are a server owner - then reset your cookies and when you login to Discord, make sure the "Know what servers you\'re in" option is shown at the login screen' }
                </Grid>
            </div>
        </>
    );
};

export default ManageServer;
