<?php

namespace App\Http\Controllers;

use App\Models\Persona;
use Illuminate\Http\Request;

class PersonaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $personas = Persona::all();
        return response()->json($personas, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->attributes->get('user')->role !== 'admin') {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $request->validate([
            'ci' => 'required|string|unique:personas,ci',
            'nombres' => 'required|string',
            'apellidos' => 'required|string',
            'fecha_nacimiento' => 'required|date',
        ]);

        $persona = Persona::create($request->all());
        return response()->json($persona, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Persona $persona)
    {
        return response()->json($persona, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Persona $persona)
    {
        if ($request->attributes->get('user')->role !== 'admin') {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $request->validate([
            'ci' => 'sometimes|required|string|unique:personas,ci,' . $persona->id,
            'nombres' => 'sometimes|required|string',
            'apellidos' => 'sometimes|required|string',
            'fecha_nacimiento' => 'sometimes|required|date',
        ]);

        $persona->update($request->all());
        return response()->json($persona, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Persona $persona)
    {
        if ($request->attributes->get('user')->role !== 'admin') {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $persona->delete();
        return response()->json(['message' => 'Persona eliminada correctamente'], 200);
    }
}
