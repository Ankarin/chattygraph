import { SignUp } from '@clerk/nextjs';
import { ImageIcon, Sparkles, Zap } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className='bg-muted grid flex-1 lg:grid-cols-2'>
      <div className='hidden flex-1 items-center justify-end p-6 md:p-10 lg:flex'>
        <ul className='max-w-sm space-y-8'>
          <li>
            <div className='flex items-center gap-2'>
              <Sparkles className='size-4' />
              <p className='font-semibold'>AI-powered infographics</p>
            </div>
            <p className='text-muted-foreground mt-2 text-sm'>
              Describe your data and ideas, and AI will create stunning infographics for you.
            </p>
          </li>
          <li>
            <div className='flex items-center gap-2'>
              <ImageIcon className='size-4' />
              <p className='font-semibold'>Professional designs</p>
            </div>
            <p className='text-muted-foreground mt-2 text-sm'>
              Get social media-ready infographics optimized for LinkedIn, Twitter, and more.
            </p>
          </li>
          <li>
            <div className='flex items-center gap-2'>
              <Zap className='size-4' />
              <p className='font-semibold'>Export to PNG</p>
            </div>
            <p className='text-muted-foreground mt-2 text-sm'>
              Download high-quality images ready to share with one click.
            </p>
          </li>
        </ul>
      </div>
      <div className='flex flex-1 items-center justify-center p-6 md:p-10 lg:justify-start'>
        <SignUp />
      </div>
    </div>
  );
}
