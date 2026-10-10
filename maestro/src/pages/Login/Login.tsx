import { MaestroLogo } from '@/components/brand/MaestroLogo'
import { UvMapBackground } from '@/components/brand/UvMapBackground'
import { Button } from '@/components/ui/Button'
import { DisplayTitle, SerifText } from '@/components/ui/Typography'
import { useLogin } from './Login.ts'

export default function Login() {
  const { values, functions } = useLogin()

  return (
    <div className="relative flex h-full min-h-screen items-center justify-center overflow-hidden bg-white">
      <div className="relative z-[1] flex w-full max-w-[828px] flex-col items-center gap-[29px] px-6 pb-[28vh] pt-16">
        <div className="anim-fade-up">
          <MaestroLogo />
        </div>

        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-2 text-center anim-fade-up anim-delay-1">
            <DisplayTitle className="!text-[48px] !leading-none">
              Welcome to Maestro
            </DisplayTitle>
            <SerifText className="!text-base !tracking-[-0.16px]">
              Login or Sign up
            </SerifText>
          </div>

          <div className="flex w-[300px] flex-col gap-4 anim-fade-up anim-delay-2">
            <Button
              maestroVariant="ghost"
              className="!w-full !justify-center"
              loading={values.isAuthenticating}
              icon={
                <img
                  src="/assets/icons/google.svg"
                  alt=""
                  width={16}
                  height={16}
                />
              }
              onClick={functions.continueWithGoogle}
            >
              Continue with Google
            </Button>
            <Button
              maestroVariant="ghost"
              className="!w-full !justify-center"
              loading={values.isAuthenticating}
              icon={
                <img
                  src="/assets/icons/internet.svg"
                  alt=""
                  width={18}
                  height={18}
                />
              }
              onClick={functions.continueWithSso}
            >
              Continue with SSO
            </Button>
          </div>

          <div className="flex max-w-[389px] flex-col gap-8 text-center anim-fade-up anim-delay-3">
            <SerifText className="!text-base !tracking-[-0.16px]">
              By clicking continue, you agree to the terms and conditions and
              the privacy policy.
            </SerifText>
            <SerifText className="!text-base !tracking-[-0.16px]">
              Dont have an account? Sign up
            </SerifText>
          </div>
        </div>
      </div>

      <div className="login-uv-band">
        <UvMapBackground variant="login" />
      </div>
    </div>
  )
}
