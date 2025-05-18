import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', 
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for autenticar-usuario...');
    return new Response('ok', { headers: corsHeaders });
  }

  let requestBody;
  try {
    requestBody = await req.json(); // Intentar parsear el cuerpo JSON
  } catch (jsonError) {
    console.error("Error parsing JSON body in 'autenticar-usuario':", jsonError.message);
    return new Response(
      JSON.stringify({ error: 'Invalid request body. Expected JSON.', details: jsonError.message }),
      {
        status: 400, // Bad Request
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Si el parseo fue exitoso, proceder con la lógica de autenticación
  try {
    const { userName, password } = requestBody;

    if (!userName || !password) {
      return new Response(JSON.stringify({ error: 'Faltan userName o password' }), {
        status: 400, // Bad Request
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas.');
      return new Response(JSON.stringify({ error: 'Configuración del servidor incompleta.' }), {
        status: 500, // Internal Server Error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, user_name, password_hash')
      .eq('user_name', userName)
      .single();

    if (userError || !userData) {
      console.error('Error al buscar usuario o usuario no encontrado:', userError ? userError.message : 'User not found');
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404, // Not Found
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const passwordMatch = bcrypt.compareSync(password, userData.password_hash);

    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), {
        status: 401, // Unauthorized
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwtSecret = Deno.env.get('CUSTOM_JWT_SECRET');
    if (!jwtSecret) {
      console.error('CUSTOM_JWT_SECRET no está configurado en las variables de entorno.');
      return new Response(JSON.stringify({ error: 'Error de configuración del servidor para JWT.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const payload = {
      iss: 'golf-cart-inspection-app',
      sub: String(userData.id),
      user_name: userData.user_name,
      exp: getNumericDate(60 * 60 * 24 * 7), // Expira en 7 días
    };

    const token = await create({ alg: "HS256", typ: "JWT" }, payload, key);

    return new Response(JSON.stringify({ token, user: { id: userData.id, userName: userData.user_name } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error en la lógica principal de autenticar-usuario:', error.message, error.stack);
    return new Response(JSON.stringify({ error: 'Error interno del servidor', details: error.message }), {
      status: 500, // Internal Server Error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
