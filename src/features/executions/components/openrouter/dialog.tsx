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

const OPENROUTER_MODELS = [
    // { id: 'meta-llama/llama-3-8b-instruct:free', label: 'Llama 3 8B Instruct (Free)' },
    // { id: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B Instruct (Free)' },
    // { id: 'google/gemma-2-9b-it:free', label: 'Gemma 2 9B IT (Free)' },
    // { id: 'qwen/qwen-2-7b-instruct:free', label: 'Qwen 2 7B Instruct (Free)' },
    // { id: 'mistralai/mistral-7b-instruct:free', label: 'Mistral 7B Instruct (Free)' },
    // { id: 'huggingfaceh4/zephyr-7b-beta:free', label: 'Zephyr 7B Beta (Free)' },
    // { id: 'openchat/openchat-7b:free', label: 'OpenChat 7B (Free)' },
    // { id: 'deepseek/deepseek-r1:free', label: 'DeepSeek R1 (Free)' },
    // { id: 'minimaxai/minimax-m2.7:free', label: 'Minimax M2.7 (Free)' },
    // Free endpoints
    { id: 'baidu/cobuddy:free', label: 'Baidu CoBuddy (Free)' },
    { id: 'openrouter/owl-alpha', label: 'Owl Alpha (Free)' },
    { id: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free', label: 'Nemotron 3 Nano Omni (Free)' },
    { id: 'poolside/laguna-xs.2:free', label: 'Poolside Laguna XS.2 (Free)' },
    { id: 'poolside/laguna-m.1:free', label: 'Poolside Laguna M.1 (Free)' },
    { id: 'inclusionai/ling-2.6-1t:free', label: 'inclusionAI Ling-2.6-1T (Free)' },
    { id: 'baidu/qianfan-ocr-fast:free', label: 'Baidu Qianfan OCR Fast (Free)' },
    { id: 'google/gemma-4-26b-a4b-it:free', label: 'Gemma 4 26B A4B (Free)' },
    { id: 'google/gemma-4-31b-it:free', label: 'Gemma 4 31B IT (Free)' },
    { id: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'Nemotron 3 Super (Free)' },
    { id: 'minimax/minimax-m2.5:free', label: 'MiniMax M2.5 (Free)' },
    { id: 'liquid/lfm-2.5-1.2b-thinking:free', label: 'Liquid LFM2.5 1.2B Thinking (Free)' },
    { id: 'liquid/lfm-2.5-1.2b-instruct:free', label: 'Liquid LFM2.5 1.2B Instruct (Free)' },
    { id: 'nvidia/nemotron-3-nano-30b-a3b:free', label: 'Nemotron 3 Nano 30B (Free)' },
    { id: 'nvidia/nemotron-nano-12b-v2-vl:free', label: 'Nemotron Nano 12B VL (Free)' },
    { id: 'qwen/qwen3-next-80b-a3b-instruct:free', label: 'Qwen 3 Next 80B Instruct (Free)' },
    { id: 'nvidia/nemotron-nano-9b-v2:free', label: 'Nemotron Nano 9B V2 (Free)' },
    { id: 'openai/gpt-oss-120b:free', label: 'OpenAI GPT-OSS 120B (Free)' },
    { id: 'openai/gpt-oss-20b:free', label: 'OpenAI GPT-OSS 20B (Free)' },
    { id: 'z-ai/glm-4.5-air:free', label: 'GLM 4.5 Air (Free)' },
    { id: 'qwen/qwen3-coder:free', label: 'Qwen 3 Coder 480B (Free)' },
    { id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', label: 'Dolphin Mistral 24B Venice Edition (Free)' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B Instruct (Free)' },
    { id: 'meta-llama/llama-3.2-3b-instruct:free', label: 'Llama 3.2 3B Instruct (Free)' },
    { id: 'nousresearch/hermes-3-llama-3.1-405b:free', label: 'Hermes 3 405B Instruct (Free)' },
    { id: 'tencent/hy3-preview:free', label: 'Tencent Hy3 Preview (Free)' },

    // { id: 'google/lyria-3-pro-preview', label: 'Lyria 3 Pro Preview (Free)' },
    // { id: 'google/lyria-3-clip-preview', label: 'Lyria 3 Clip Preview (Free)' },
    // { id: 'openrouter/free', label: 'Free Models Router' },
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

export type OpenRouterFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<OpenRouterFormValues>;
};

export const OpenRouterDialog = ({
    open, 
    onOpenChange,
    onSubmit,
    defaultValues = {},
 }: Props) => {
    const { 
                data: credentials,
                isLoading: isLoadingCredentials,
            } = useCredentialsByType(CredentialType.OPENROUTER);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || '',
            credentialId: defaultValues.credentialId || '',
            model: defaultValues.model || 'meta-llama/llama-3-8b-instruct:free',
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
                model: defaultValues.model || 'meta-llama/llama-3-8b-instruct:free',
                systemPrompt: defaultValues.systemPrompt || '',
                userPrompt: defaultValues.userPrompt || '',
            })
        }
    },[open, defaultValues, form]);

    const watchVariableName = form.watch('variableName') || 'myOpenRouter';

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        console.log('Form values: ', values);
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>OpenRouter Configuration</DialogTitle>
                    <DialogDescription>
                        Configure the OpenRouter model and prompts for this node. All listed models are free.
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
                                    <FormLabel>OpenRouter API Key</FormLabel>
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
                                                            src={'/logos/openrouter (1).svg'}
                                                            alt={'OpenRouter'}
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
                                            {OPENROUTER_MODELS.map((model) => (
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
                                        Select a free OpenRouter model to use.
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
