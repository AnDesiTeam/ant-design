import * as React from 'react';
import InternalAvatar, { AvatarProps } from './avatar';
import Group from './group';

export { AvatarProps } from './avatar';
export { GroupProps } from './group';

export interface AvatarInterface
  extends React.ForwardRefExoticComponent<AvatarProps & React.RefAttributes<HTMLElement>> {
  Group: typeof Group;
}

const Avatar = InternalAvatar as AvatarInterface;
Avatar.Group = Group;

export { Group };
export default Avatar;
