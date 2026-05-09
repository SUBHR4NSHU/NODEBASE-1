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

const GEMINI_MODELS = [
    // { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    // { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    // { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    // { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
    // { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS' },
    // { id: 'gemini-2.0-pro-exp', name: 'Gemini 2.0 Pro Experimental' },
    // { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    // { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    // { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B' },
    // Text
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite' },
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2 Flash' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2 Flash Lite' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B' },

  // Audio / TTS / Live
  { id: 'gemini-2.5-flash-preview-native-audio-dialog', name: 'Gemini 2.5 Native Audio' },
  { id: 'gemini-3-flash-live', name: 'Gemini 3 Flash Live' },
  { id: 'gemini-2.5-flash-preview-tts', name: 'Gemini 2.5 Flash TTS' },
  { id: 'gemini-3.1-flash-tts', name: 'Gemini 3.1 Flash TTS' },
  { id: 'gemini-2.5-pro-preview-tts', name: 'Gemini 2.5 Pro TTS' },

  // Image
  { id: 'imagen-4-generate', name: 'Imagen 4' },
  { id: 'imagen-4-ultra-generate', name: 'Imagen 4 Ultra' },
  { id: 'imagen-4-fast-generate', name: 'Imagen 4 Fast' },
  { id: 'gemini-2.5-flash-image-preview', name: 'Nano Banana' },
  { id: 'gemini-3-pro-image', name: 'Nano Banana Pro' },
  { id: 'gemini-3.1-flash-image', name: 'Nano Banana 2' },

  // Video / Music
  { id: 'lyria-3-clip', name: 'Lyria 3 Clip' },
  { id: 'lyria-3-pro', name: 'Lyria 3 Pro' },
  { id: 'veo-3-generate', name: 'Veo 3' },
  { id: 'veo-3-fast-generate', name: 'Veo 3 Fast' },
  { id: 'veo-3-lite-generate', name: 'Veo 3 Lite' },

  // Gemma
  { id: 'gemma-3-1b-it', name: 'Gemma 3 1B' },
  { id: 'gemma-3-2b-it', name: 'Gemma 3 2B' },
  { id: 'gemma-3-4b-it', name: 'Gemma 3 4B' },
  { id: 'gemma-3-12b-it', name: 'Gemma 3 12B' },
  { id: 'gemma-3-27b-it', name: 'Gemma 3 27B' },
  { id: 'gemma-4-26b-it', name: 'Gemma 4 26B' },
  { id: 'gemma-4-31b-it', name: 'Gemma 4 31B' },

  // Embeddings
  { id: 'gemini-embedding-001', name: 'Gemini Embedding 1' },
  { id: 'gemini-embedding-002', name: 'Gemini Embedding 2' },
  { id: 'text-embedding-004', name: 'Text Embedding 004' },
  { id: 'embedding-001', name: 'Embedding 001' },

  // Robotics / Agents
  { id: 'gemini-robotics-er-1.5-preview', name: 'Gemini Robotics ER 1.5' },
  { id: 'gemini-robotics-er-1.6-preview', name: 'Gemini Robotics ER 1.6' },
  { id: 'deep-research-pro-preview', name: 'Deep Research Pro' },
  { id: 'computer-use-preview', name: 'Computer Use Preview' },
];

const formSchema = z.object({
    variableName: z
    .string()
    .min(1, { message: 'Variable name is required'})
    .regex(/^[a-zA-Z_$][A-Za-z0-9_$]*$/, {
        message: 'Variable name must start with a letter or underscore and contain only letters, numbers and underscores.'
    }),
    credentialId: z.string().min(1, 'Credential is required'),
    modelId: z.string().min(1, 'Model is required'),
    systemPrompt: z.string().optional(),
    userPrompt: z.string().min(1, 'User prompt is required'),
});

export type GeminiFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<GeminiFormValues>;
};

export const GeminiDialog = ({
    open, 
    onOpenChange,
    onSubmit,
    defaultValues = {},
 }: Props) => {
    const { 
        data: credentials,
        isLoading: isLoadingCredentials,
    } = useCredentialsByType(CredentialType.GEMINI);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || '',
            credentialId: defaultValues.credentialId || '',
            modelId: defaultValues.modelId || 'gemini-2.5-flash',
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
                modelId: defaultValues.modelId || 'gemini-2.5-flash',
                systemPrompt: defaultValues.systemPrompt || '',
                userPrompt: defaultValues.userPrompt || '',
            })
        }
    },[open, defaultValues, form]);

    const watchVariableName = form.watch('variableName') || 'myGemini';

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        console.log('Form values: ', values);
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gemini Configuration</DialogTitle>
                    <DialogDescription>
                        Configure the AI model and prompts for this node.
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
                                    <FormLabel>Gemini Credential</FormLabel>
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
                                                            src={'/logos/gemini.svg'}
                                                            alt={'Gemini'}
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
                            name="modelId"
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
                                            {GEMINI_MODELS.map((model) => (
                                                <SelectItem
                                                    key={model.id}
                                                    value={model.id}
                                                >
                                                    {model.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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