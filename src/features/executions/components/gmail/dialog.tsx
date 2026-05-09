'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useCredentialsByType } from '@/features/credentials/hooks/use-credentials';
import { CredentialType } from '@/generated/prisma';
import Image from 'next/image';

import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectContent
} from '@/components/ui/select';

const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: 'Variable name is required' })
        .regex(/^[a-zA-Z_$][A-Za-z0-9_$]*$/, {
            message: 'Variable name must start with a letter or underscore and contain only letters, numbers and underscores.',
        }),
    credentialId: z.string().min(1, 'Gmail credential is required'),
    to: z
        .string()
        .min(1, 'Recipient email is required'),
    subject: z
        .string()
        .min(1, 'Subject is required'),
    body: z
        .string()
        .min(1, 'Email body is required'),
});

export type GmailFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<GmailFormValues>;
};

export const GmailDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const {
        data: credentials,
        isLoading: isLoadingCredentials,
    } = useCredentialsByType(CredentialType.GMAIL);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || '',
            credentialId: defaultValues.credentialId || '',
            to: defaultValues.to || '',
            subject: defaultValues.subject || '',
            body: defaultValues.body || '',
        },
    });

    // Reset form values when dialog opens with new defaults
    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || '',
                credentialId: defaultValues.credentialId || '',
                to: defaultValues.to || '',
                subject: defaultValues.subject || '',
                body: defaultValues.body || '',
            });
        };
    }, [open, defaultValues, form]);

    const watchVariableName = form.watch('variableName') || 'myGmail';

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[85vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Gmail Configuration</DialogTitle>
                    <DialogDescription>
                        Select your connected Gmail account and configure the email content for this node.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-6 mt-4'
                    >
                        <FormField
                            control={form.control}
                            name='variableName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={watchVariableName}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Use this name to reference the result in other nodes:{' '}
                                        {`{{${watchVariableName}.messageId}}`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gmail Account</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={
                                            isLoadingCredentials ||
                                            !credentials?.length
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a Gmail account" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {credentials?.map((credential) => (
                                                <SelectItem
                                                    key={credential.id}
                                                    value={credential.id}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src={'/logos/gmail.svg'}
                                                            alt={'Gmail'}
                                                            width={16}
                                                            height={16}
                                                        />
                                                        {credential.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!isLoadingCredentials && (!credentials || credentials.length === 0) && (
                                        <FormDescription className="text-amber-600 dark:text-amber-400">
                                            No Gmail accounts connected. Go to Credentials → Create → Gmail to connect one.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='to'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='recipient@example.com'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Recipient email. Supports Handlebars:{' '}
                                        {'{{myForm.email}}'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='subject'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='Workflow notification'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Supports Handlebars: {'{{myGemini.text}}'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='body'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Body</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className='min-h-[120px] font-mono text-sm'
                                            placeholder={`Hello,\n\nHere is your summary:\n{{myGemini.text}}`}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The email body. Use {'{{variables}}'} for values or
                                        {' {{json variable}}'} to stringify objects.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className='mt-4'>
                            <Button type='submit'>Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
