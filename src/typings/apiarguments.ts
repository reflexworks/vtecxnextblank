import { AdduserInfo } from '@vtecx/vtecxnext'

/**
 * PassReset型
 */
export interface PassReset extends AdduserInfo {}

/**
 * ChangePass型
 */
export interface ChangePass {
  newpswd: string
  oldpswd?: string
  passresetToken?: string
}
