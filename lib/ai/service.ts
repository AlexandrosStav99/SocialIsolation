import { deterministicAiFallback } from "./fallback";
import { minimiseFreeTextForAi } from "./privacy";
import type { AiConversationInput, AiConversationOutput, AiConversationProvider } from "./types";
import { validateAiConversationOutput } from "./validation";

const AI_TIMEOUT_MS=5000;

export async function assistConversation(provider:AiConversationProvider,input:AiConversationInput):Promise<AiConversationOutput>{
  const safeText=minimiseFreeTextForAi(input.freeText);
  if(!safeText) return deterministicAiFallback;
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),AI_TIMEOUT_MS);
  try{
    const raw=await provider.interpret({...input,freeText:safeText},controller.signal);
    const validated=validateAiConversationOutput(raw);
    if(!validated) return deterministicAiFallback;
    const allowed=new Set(input.allowedTopics);
    return {...validated,suggestedTopics:validated.suggestedTopics.filter((topic)=>allowed.has(topic))};
  }catch{
    return deterministicAiFallback;
  }finally{clearTimeout(timeout);}
}
