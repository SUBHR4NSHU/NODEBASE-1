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
import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectContent
} from '@/components/ui/select';
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

const NVIDIA_MODELS = [
    // Free Preview Models
    { id: 'meta/llama-4-maverick-17b-128e-instruct', label: 'Llama 4 Maverick 17B Instruct' },
    { id: 'moonshotai/kimi-k2-instruct', label: 'Kimi K2 Instruct' },
    { id: 'stepfun-ai/step-3.5-flash', label: 'Step 3.5 Flash' },
    { id: 'z-ai/glm-4.7', label: 'GLM 4.7' },
    { id: 'mistralai/mistral-nemotron', label: 'Mistral Nemotron' },
    { id: 'minimaxai/minimax-m2.7', label: 'Minimax M2.7' },
    { id: 'google/gemma-3-27b-it', label: 'Gemma 3 27B IT' },
    { id: 'mistralai/mistral-large-3-675b-instruct-2512', label: 'Mistral Large 3 (2512)' },
    { id: 'qwen/qwen3-coder-480b-a35b-instruct', label: 'Qwen 3 Coder 480B' },
    { id: 'mistralai/devstral-2-123b-instruct-2512', label: 'Devstral 2 123B (2512)' },
    { id: 'moonshotai/kimi-k2-thinking', label: 'Kimi K2 Thinking' },
    { id: 'google/gemma-3n-e4b-it', label: 'Gemma 3n e4b IT' },
    { id: 'mistralai/magistral-small-2506', label: 'Magistral Small (2506)' },
    { id: 'bytedance/seed-oss-36b-instruct', label: 'Seed OSS 36B Instruct' },
    { id: 'mistralai/mistral-medium-3-instruct', label: 'Mistral Medium 3' },
    { id: 'nvidia/nemotron-mini-4b-instruct', label: 'Nemotron Mini 4B' },
    { id: 'google/gemma-2-2b-it', label: 'Gemma 2 2B IT' },
    { id: 'microsoft/phi-4-multimodal-instruct', label: 'Phi 4 Multimodal Instruct' },
    { id: 'abacusai/dracarys-llama-3_1-70b-instruct', label: 'Dracarys Llama 3.1 70B' },
    { id: 'google/gemma-3n-e2b-it', label: 'Gemma 3n e2b IT' },
    
];

const formSchema = z.object({
    variableName: z
    .string()
    .min(1, { message: 'Variable name is required'})
    .regex(/^[a-zA-Z_$][A-Za-z0-9_$]*$/, {
        message: 'Variable name must start with a letter or underscore and contain only letters, numbers and underscores.'
    }),
    credentialId: z.string().min(1, 'Credential is required'),
    model: z.string().min(1, 'Model is required'),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, 'User prompt is required'),
});

export type NvidiaFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<NvidiaFormValues>;
};

export const NvidiaDialog = ({
    open, 
    onOpenChange,
    onSubmit,
    defaultValues = {},
 }: Props) => {
    const { 
                data: credentials,
                isLoading: isLoadingCredentials,
            } = useCredentialsByType(CredentialType.NVIDIA);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || '',
            credentialId: defaultValues.credentialId || '',
            model: defaultValues.model || 'meta/llama-3.1-8b-instruct',
            systemPrompt: defaultValues.systemPrompt || '',
            userPrompt: defaultValues.userPrompt || '',
        },
    });

    // Reset form values when dialog opens with new defaults
    useEffect(()=>{
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || '',
                credentialId: defaultValues.credentialId || '',
                model: defaultValues.model || 'meta/llama-3.1-8b-instruct',
                systemPrompt: defaultValues.systemPrompt || '',
                userPrompt: defaultValues.userPrompt || '',
            })
        }
    },[open, defaultValues, form]);

    const watchVariableName = form.watch('variableName') || 'myNvidia';

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        console.log('Form values: ', values);
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nvidia NIM Configuration</DialogTitle>
                    <DialogDescription>
                        Configure the Nvidia NIM model and prompts for this node.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className='space-y-8 mt-4'
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
                                        Use this name to reference the result in other nodes: {' '}
                                        {`{{${watchVariableName}.text}}`}
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="credentialId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nvidia API Key</FormLabel>
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
                                                <SelectValue />
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
                                                            src={'/logos/nvidia-color.svg'}
                                                            alt={'Nvidia'}
                                                            width={16}
                                                            height={16}
                                                        />
                                                        {credential.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Model</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a model" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {NVIDIA_MODELS.map((model) => (
                                                <SelectItem
                                                    key={model.id}
                                                    value={model.id}
                                                >
                                                    {model.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select a Nvidia NIM preview model to use.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                            <FormField
                                name='systemPrompt'
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>System Prompt (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className='min-h-[80px] font-mono text-sm'
                                                placeholder={`You are a helpful assistant.`}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Sets the behavior of the assistant. Use {"{{variables}}"} for simple values or
                                            {" {{json variable}}"} to stringify objects
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name='userPrompt'
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User Prompt</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className='min-h-[120px] font-mono text-sm'
                                                placeholder={'Summarize this text: {{json httpResponse.data}}'}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The prompt to send to the AI. Use {"{{variables}}"} for simple values or
                                            {" {{json variable}}"} to stringify objects
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
