import { Cloud, Copy, Loader2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo } from 'react';
import { getFieldValue, useQRScoutState } from '../../store/store';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { PreviewText } from './PreviewText';
import { createRoot } from 'react-dom/client';

export interface QRModalProps {
    disabled?: boolean;
}

export function QRModal(props: QRModalProps) {
    const fieldValues = useQRScoutState(state => state.fieldValues);
    const formData = useQRScoutState(state => state.formData);
    const title = `${getFieldValue('robot')} - M${getFieldValue(
        'matchNumber',
    )}`.toUpperCase();

    const qrCodePreview = useMemo(
        () => fieldValues.map(f => f.value).join(','),
        [fieldValues],
    );
    const qrCodeData = useMemo(
        () => fieldValues.map(f => f.value).join(formData.delimiter).replace(/'/g, "").replace(/,No,/, ",0,").replace(/,Yes,/, ",1,"),
        [fieldValues],
    );
    const pwa = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    let uploadInProgress = false;
    async function sha256(text: string) {
        const txtBuffer = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest("SHA-256", txtBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        return hashHex;
    }
    //Two seperate values are required- qrCodePreview is what is shown to the user beneath the QR code, qrCodeData is the actual data.

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button disabled={props.disabled}>
                    <QrCode className="size-5" />
                    Commit
                </Button>
            </DialogTrigger>
            <Button onClick={async () => {
                if (uploadInProgress) return;
                const uplbtn = document.getElementById("upload-button");
                if (uplbtn) {
                    const root = createRoot(uplbtn);
                    root.render(
                        <div className='inline-block animate-spin'>
                            <Loader2 className='size-4'></Loader2>
                        </div>
                    )
                }
                try {
                    uploadInProgress = true;
                    let urlIsValid = false;
                    try {
                        const r = await fetch(new URL("health", formData.uploadURL).toString());
                        if (r.ok) {
                            const t = await r.text();
                            urlIsValid = t.trim().includes("Sentinel is watching");
                        }
                        // check login
                        const is_logged = await fetch(new URL("我是谁", formData.uploadURL).toString(), {
                            credentials: 'include',
                        });
                        if (!(await is_logged.json())["logged_in"]) {
                            const un = prompt("Enter username:")
                            const pw = prompt("Enter password:")
                            if (un && pw) {
                                const login = await fetch(new URL("login", formData.uploadURL).toString(), {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        username: un,
                                        password: await sha256(pw)
                                    })
                                });

                                if (!login.ok) {
                                    alert(`Error logging in: ${await login.text()}`);
                                    return;
                                }
                            } else {
                                console.log("UN or PW omitted");
                            }
                        } else console.log("Already logged in");
                    } catch (e) { if (!urlIsValid) alert("The URL you are trying to upload to is invalid or inactive."); else alert(`Error: ${e}`); return; }
                    if (!urlIsValid) {
                        alert("The URL you are trying to upload to is invalid or inactive.");
                        return;
                    }
                    const blob = new Blob([qrCodePreview.replace(/'/g, "").replace(/,No,/, ",0,").replace(/,Yes,/, ",1,")], { type: 'text/plain' });
                    const fData = new FormData();
                    fData.append("data", blob, "data.csv");

                    await fetch(new URL("append", formData.uploadURL).toString(), {
                        method: 'POST',
                        credentials: 'include',
                        body: fData,
                    });

                    alert("Upload successfully sent.");
                } finally {
                    uploadInProgress = false;
                    if (uplbtn) {
                        const root = createRoot(uplbtn);
                        root.render(
                            <>
                                <Cloud className='size-5' />
                                Upload
                            </>

                        )
                    }
                }
            }} disabled={props.disabled || pwa} id="upload-button">
                <Cloud className='size-5' />
                Upload
            </Button>
            <DialogContent>
                <DialogTitle className="text-3xl text-primary text-center font-rhr-ns tracking-wider ">
                    {title}
                </DialogTitle>
                <div className="flex flex-col items-center gap-6">
                    <div className="bg-white p-4 rounded-md">
                        <QRCodeSVG className="m-2 mt-4" size={256} value={qrCodeData} />
                    </div>
                    <PreviewText data={qrCodePreview} />
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(qrCodeData)}
                    >
                        <Copy className="size-4" /> Copy Data
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
