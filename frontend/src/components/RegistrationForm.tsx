import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { useAuthStore } from '@/store/useUserStore'
import { EditIcon } from '@/assets/icons/icons'
import { useState, useEffect } from 'react'
import api from '@/api/axios'
import { useTranslation } from 'react-i18next'

export default function RegistrationForm() {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')

    const displayName = useAuthStore((state) => state.user?.displayName)
    const telegramId = useAuthStore((state) => state.user?.telegramId)
    const isNewUser = useAuthStore((state) => state.user?.isNewUser)
    const isNewUserFromStorage = localStorage.getItem('new') === "true";

    const updateDisplayName = useAuthStore((state) => state.updateDisplayName)
    const setNewName = async() => {
        try {
            await api.post('/user/set-user-name', {
                telegramId: telegramId,
                name: name
            })   
            localStorage.setItem('new', "false")
            updateDisplayName(name)  
            setIsOpen(false)
        } catch (error) {
            console.log('❌ Error setting name:', error);
        }
    }

    useEffect(() => {
        if (isNewUserFromStorage) {
            setIsOpen(true);
        }
    }, [isNewUser])
    
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="z-[100] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-[20px] bg-[#121318]/95 backdrop-blur-[20px] max-h-[560px] w-[300px] p-6 duration-200 border border-[#AED2FF]/30" style={{
            boxShadow: `
              0 0 2px rgba(174,210,255,0.8),
              0 0 5px rgba(174,210,255,0.4),
              0 0 10px rgba(174,210,255,0.3),
              0 0 16px rgba(174,210,255,0.4),
              0 0 26px rgba(174,210,255,0.3),
              inset 0 1px 4px rgba(174,210,255,0.3),
              inset 0 0px 10px rgba(174,210,255,0.2)
            `
        }}>
                <DialogHeader>
                    <DialogTitle className="font-encode font-semibold text-[14px] text-[#E4F1FF] mt-5 mb-1">{t('registrationForm.welcome', { name: displayName })}</DialogTitle>
                </DialogHeader>
                    <div className='flex flex-col items-center gap-2'>
                        <div className='w-full flex items-center justify-center'>
                            <p className='font-encode font-normal text-[12px] text-[#E4F1FF] text-center w-[110px]'>
                                {/* {t('registrationForm.enterName')} */}
                            </p>
                        </div>
                        <div className='px-1 py-1.5 w-full max-w-[168px] rounded-[6px] bg-[#5D6E8B40] mb-1'>
                            <p className='font-encode text-[8px] text-[#AED2FF] font-medium text-center'>
                                {t('registrationForm.nameOnce')}
                            </p>
                        </div>
                        <form action="">
                            <div className='bg-[#21262F] max-w-[168px] w-full rounded-[5px] flex gap-1 h-8'>
                                <input 
                                    type="text" 
                                    placeholder={t('registrationForm.namePlaceholder')} 
                                    className='w-[85%] px-2 py-1 font-encode font-normal text-[#E4F1FF] text-[10px] outline-none'
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <div className='w-[15%] flex items-center justify-center'>
                                    <EditIcon />
                                </div>
                            </div>
                            <p className='font-encode text-[#6DA0E1] font-normal text-[8px] text-center mt-1 mb-3'>
                                {t('registrationForm.notNecessary')}
                            </p>
                            <DialogClose  
                                className='w-full h-9'
                                onClick={setNewName}     
                            >
                                <div className="flex items-center justify-center bg-[#6DA0E166]/90 border border-[#AED2FF80]/90 max-w-[168px] w-full h-full max-h-[34px] rounded-[17px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180] mb-2 mt-2">
                                    <span className="font-encode font-medium text-[10px] text-[#E4F1FF] h-5 [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF] flex items-center justify-center">{t('registrationForm.continueWithName')}</span>
                                </div>
                            </DialogClose>
                            
                            
                        </form>
                        <p className='font-encode text-[#6DA0E1] font-normal text-[8px] text-center pt-[10px]'>
                            {t('registrationForm.or')}
                        </p>
                        <DialogClose>
                                <div className="w-full flex justify-center" onClick={() =>{
                                    localStorage.setItem('new', "false")
                                }}>
                                    <div className="bg-[#6DA0E1] shadow-[0_0_2px_0_rgba(109,160,225,0.6),0_0_6px_0_rgba(109,160,225,0.6),0_0_16px_0_rgba(109,160,225,0.4)] w-[168px] mb-3 h-8 rounded-[17px] flex items-center justify-center">
                                        <span className="font-encode text-[10px] font-semibold text-[#121318]">{t('registrationForm.continueAs', { name: displayName })}</span>
                                    </div>
                                </div>
                        </DialogClose>

                    </div>
                </DialogContent>
    </Dialog>
)
}
