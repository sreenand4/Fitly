"use client";

import { Amplify } from "aws-amplify";
import amplifyconfig from "../../amplify_outputs.json";

export function ConfigureAmplifyClientSide() {
  try {
    Amplify.configure(amplifyconfig, { ssr: true });
  } catch (error) {
    console.error('Error configuring Amplify:', error);
  }
  return null;
}