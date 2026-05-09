'use client';

import { CredentialType } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { useCreateCredential, useSuspenseCredential, useUpdateCredential } from "../hooks/use-credentials";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
    Form,
    FormDescription,
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
    FormField
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectContent
} from '@/components/ui/select';

import {
    Card,
    CardContent,
    CardHeader,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from "next/link";

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(CredentialType),
    value: z.string().optional(),
}).refine((data) => {
    // Gmail uses OAuth — no API key needed
    if (data.type === CredentialType.GMAIL) return true;
    // All other types require an API key
    return !!data.value && data.value.length > 0;
}, {
    message: 'API Key is required',
    path: ['value'],
});

type FormValues = z.infer<typeof formSchema>;

const credentialTypeOptions = [
    {
        value: CredentialType.GEMINI,
        label: 'Gemini',
        logo: '/logos/gemini.svg',
    },
    {
        value: CredentialType.OPENAI,
        label: 'OpenAI',
        logo: '/logos/openai.svg',
    },
    {
        value: CredentialType.ANTHROPIC,
        label: 'Anthropic',
        logo: '/logos/anthropic.svg',
    },
    {
        value: CredentialType.NVIDIA,
        label: 'Nvidia',
        logo: '/logos/nvidia-color.svg',
    },
    {
        value: CredentialType.OPENROUTER,
        label: 'OpenRouter',
        logo: '/logos/openrouter (1).svg',
    },
    {
        value: CredentialType.NOTION,
        label: 'Notion',
        logo: '/logos/notion.svg',
    },
    {
        value: CredentialType.GMAIL,
        label: 'Gmail',
        logo: '/logos/gmail.svg',
    },
];

interface CredentialFormProps {
    initialData?: {
        id?: string;
        name: string;
        type: CredentialType;
        value: string;
    };   
};

export const CredentialForm = ({
    initialData,
}: CredentialFormProps) => {
    const router = useRouter();
    const createCredential = useCreateCredential();
    const updateCredential = useUpdateCredential();
    const { handleError, modal } = useUpgradeModal();

    const isEdit = !!initialData?.id;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            type: CredentialType.GEMINI,
            value: '',
        },
    });

    const watchedType = form.watch('type');
    const isGmail = watchedType === CredentialType.GMAIL;

    const handleGoogleConnect = () => {
        const name = form.getValues('name') || 'My Gmail';
        window.location.href = `/api/oauth/google?name=${encodeURIComponent(name)}`;
    };

    const onSubmit = async (values: FormValues) => {
        if (isEdit && initialData?.id) {
            await updateCredential.mutateAsync({
                id: initialData.id,
                name: values.name,
                type: values.type,
                value: values.value || '',
            });
        } else {
            await createCredential.mutateAsync({
                name: values.name,
                type: values.type,
                value: values.value || '',
            }, {
                onSuccess: (data) => {
                    router.push(`/credentials/${data.id}`);
                },
                onError: (error) => {
                    handleError(error);
                },

            })
        }
    };

    return (
        <>
            {modal}
            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle>
                        {isEdit ? 'Edit Credential' : 'Create Credential'}
                    </CardTitle>
                    <CardDescription>
                        {isEdit
                            ? 'Update your API key or credential details'
                            : 'Add a new API key or credential to your account'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder={isGmail ? "My Gmail Account" : "My API key"} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {credentialTypeOptions.map((option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Image
                                                                src={option.logo}
                                                                alt={option.label}
                                                                width={16}
                                                                height={16}
                                                            />
                                                            {option.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Show API Key field for non-Gmail types */}
                            {!isGmail && (
                                <FormField
                                    control={form.control}
                                    name="value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>API Key</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="sk-..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Gmail OAuth info message */}
                            {isGmail && !isEdit && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-4 text-sm text-blue-800 dark:text-blue-300">
                                    <p className="font-medium mb-1">Google OAuth Connection</p>
                                    <p>
                                        Click the button below to securely connect your Gmail account via Google.
                                        You&apos;ll be redirected to Google&apos;s consent screen to authorize sending emails on your behalf.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                {isGmail && !isEdit ? (
                                    <Button
                                        type="button"
                                        onClick={handleGoogleConnect}
                                        className="gap-2"
                                    >
                                        <Image
                                            src="/logos/gmail.svg"
                                            alt="Google"
                                            width={16}
                                            height={16}
                                        />
                                        Connect with Google
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={
                                            createCredential.isPending ||
                                            updateCredential.isPending
                                        }
                                    >
                                        {isEdit ? 'Update' : 'Create'}
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant={'outline'}
                                    asChild                                 
                                >
                                    <Link href='/credentials' prefetch>
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
};

export const CredentialView = ({ credentialId }: {credentialId: string}) => {
    
    const { data: credential } = useSuspenseCredential(credentialId);

    return <CredentialForm initialData={credential} />
};