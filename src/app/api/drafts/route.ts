import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { Player, Team } from '@/store/useDraftStore';

// Initialize the Groq client. It automatically finds process.env.GROQ_API_KEY
const groq = new Groq();

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const { team, availablePlayers } = body as { team: Team; availablePlayers: Player[] };

    if (!team || !availablePlayers || availablePlayers.length === 0) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const topProspects = availablePlayers.slice(0, 10);
    const prospectsList = topProspects.map(p => 
      `ID: ${p.id} | Rank: ${p.rank} | Name: ${p.name} | Pos: ${p.position} | Desc: ${p.description}`
    ).join('\n');

    const systemPrompt = `You are the General Manager for the ${team.name}. 
Your team's biggest positional needs are: ${team.needs.join(', ')}.
Team Context: ${team.context}

Review the top available prospects below and select ONE player to draft. 
Balance taking the best player available with addressing your team's specific needs.

Available Prospects:
${prospectsList}

You MUST respond in valid JSON format exactly like this:
{
  "playerId": "the id of the player you selected",
  "reasoning": "A one-sentence explanation of why you made this pick."
}`;

    // The Groq API call
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Groq's lightning-fast Llama 3 model
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) throw new Error("No response from LLM");

    const parsedResponse = JSON.parse(aiResponse);
    console.log("Groq AI Raw Output:", parsedResponse)
const selectedPlayer = topProspects.find(p => String(p.id) === String(parsedResponse.playerId));    
    if (!selectedPlayer) {
        throw new Error("LLM hallucinated a player ID");
    }

    return NextResponse.json({ 
      player: selectedPlayer, 
      reasoning: parsedResponse.reasoning 
    });

  } catch (error) {
    console.error("AI Draft Error:", error);

    const available = body?.availablePlayers as Player[] || [];
    const currentTeam = body?.team as Team;

    if (available.length > 0 && currentTeam) {
        const fallbackPlayer = available.find(p => currentTeam.needs.includes(p.position)) || available[0];
        
        return NextResponse.json({ 
            player: fallbackPlayer, 
            reasoning: `Auto-selected ${fallbackPlayer.name} due to API timeout or error.` 
        });
    }

    return NextResponse.json({ error: 'Failed to process draft pick' }, { status: 500 });
  }
}