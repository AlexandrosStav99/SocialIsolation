import type { AiConversationInput, AiConversationProvider } from "./types";

type OpenAIContent={type?:string;text?:string};
type OpenAIOutput={type?:string;content?:OpenAIContent[]};
type OpenAIResponse={output?:OpenAIOutput[]};

function extractOutputText(data:OpenAIResponse):string|undefined{
  for(const item of data.output??[]) for(const content of item.content??[]) if(content.type==="output_text"&&content.text) return content.text;
  return undefined;
}

export class OpenAIConversationProvider implements AiConversationProvider{
  constructor(private readonly apiKey:string,private readonly model=process.env.OPENAI_CONVERSATION_MODEL ?? "gpt-5.4-mini"){}
  async interpret(input:AiConversationInput,signal?:AbortSignal):Promise<unknown>{
    const response=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",signal,
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},
      body:JSON.stringify({
        model:this.model,
        store:false,
        instructions:"You assist a support-navigation check-in. Do not diagnose, assess safety, rank services, or request identity/contact data. Return only the requested JSON.",
        input:[{role:"user",content:[{type:"input_text",text:JSON.stringify({language:input.language,freeText:input.freeText,allowedTopics:input.allowedTopics})}]}],
        text:{format:{type:"json_schema",name:"talkpoint_conversation_assist",strict:true,schema:{type:"object",additionalProperties:false,properties:{suggestedTopics:{type:"array",maxItems:3,items:{type:"string",enum:input.allowedTopics}},clarification:{type:["string","null"],maxLength:240}},required:["suggestedTopics","clarification"]}}},
      }),
    });
    if(!response.ok) throw new Error("AI provider request failed");
    const data=await response.json() as OpenAIResponse;
    const outputText=extractOutputText(data);
    if(!outputText) throw new Error("AI provider returned no structured text");
    const parsed=JSON.parse(outputText) as {suggestedTopics:unknown;clarification:unknown};
    return {...parsed,...(parsed.clarification===null?{clarification:undefined}:{})};
  }
}
