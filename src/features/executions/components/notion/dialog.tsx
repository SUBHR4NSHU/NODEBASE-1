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
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

const NOTION_ACTIONS = [
    { value: 'create_page', label: 'Create Page' },
    { value: 'update_page', label: 'Update Page' },
    { value: 'query_database', label: 'Query Database' },
    { value: 'append_block', label: 'Append Block Children' },
] as const;

const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: 'Variable name is required' })
        .regex(/^[a-zA-Z_$][A-Za-z0-9_$]*$/, {
            message: 'Variable name must start with a letter or underscore and contain only letters, numbers and underscores.',
        }),
    action: z.string().min(1, 'Action is required'),
    databaseId: z.string().optional(),
    pageId: z.string().optional(),
    content: z
        .string()
        .min(1, 'Content or properties JSON is required'),
    apiKey: z.string().min(1, 'Notion API key (Integration Token) is required'),
});

export type NotionFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<NotionFormValues>;
};

export const NotionDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || '',
            action: defaultValues.action || 'create_page',
            databaseId: defaultValues.databaseId || '',
            pageId: defaultValues.pageId || '',
            content: defaultValues.content || '',
            apiKey: defaultValues.apiKey || '',
        },
    });

    // Reset form values when dialog opens with new defaults
    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || '',
                action: defaultValues.action || 'create_page',
                databaseId: defaultValues.databaseId || '',
                pageId: defaultValues.pageId || '',
                content: defaultValues.content || '',
                apiKey: defaultValues.apiKey || '',
            });
        };
    }, [open, defaultValues, form]);

    const watchVariableName = form.watch('variableName') || 'myNotion';
    const watchAction = form.watch('action');

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[85vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Notion Configuration</DialogTitle>
                    <DialogDescription>
                        Configure the Notion API settings for this node.
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
                                        {`{{${watchVariableName}.result}}`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='apiKey'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notion Integration Token</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='password'
                                            placeholder='ntn_...'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Create an integration at notion.so/my-integrations and paste the Internal Integration Secret here.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='action'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Action</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select an action' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {NOTION_ACTIONS.map((action) => (
                                                <SelectItem key={action.value} value={action.value}>
                                                    {action.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        The Notion API action to perform.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {(watchAction === 'create_page' || watchAction === 'query_database') && (
                            <FormField
                                control={form.control}
                                name='databaseId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Database ID</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='e.g. 8c4d8a1e-2b3f-...'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The Notion database ID. Find it in the database URL after the workspace name.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {(watchAction === 'update_page' || watchAction === 'append_block') && (
                            <FormField
                                control={form.control}
                                name='pageId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Page ID</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='e.g. a1b2c3d4-...'
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The Notion page ID to update or append blocks to.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            name='content'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content / Properties (JSON)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className='min-h-[120px] font-mono text-sm'
                                            placeholder={`{\n  "Name": { "title": [{ "text": { "content": "{{myGemini.text}}" } }] }\n}`}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        JSON properties for the action. Use {'{{variables}}'} for interpolation or
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
