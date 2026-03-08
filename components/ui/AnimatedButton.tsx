import React from 'react';
import styles from './AnimatedButton.module.css';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ text, className, ...props }) => {
  return (
    <button className={`${styles.button} ${className || ''}`} {...props}>
      <span>{text}</span>
    </button>
  );
};
