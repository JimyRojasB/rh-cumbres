import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { workerService } from './workerService'
import toast from 'react-hot-toast'
import { Save, ArrowLeft, Plus, Trash2, User, Briefcase, GraduationCap, Heart, Users, Phone, CreditCard } from 'lucide-react'

const CATEGORIAS = ['Oficial', 'Operario', 'Peón', 'Capataz', 'Maestro de Obra', 'Técnico', 'Ingeniero']
const BANCOS = ['BCP', 'Interbank', 'BBVA', 'Scotiabank', 'BanBif', 'Pichincha', 'Otro']
const AFPS = ['Habitat', 'Integra', 'Prima', 'Profuturo']

function SectionHeader({ icon: Icon, title, color = 'bg-navy-700' }) {
  return (
    <div className={`${color} text-white px-4 py-2.5 flex items-center gap-2 rounded-t-lg`}>
      <Icon size={16} />
      <span className="text-sm font-semibold uppercase tracking-wide">{title}</span>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-0.5">{error.message}</p>}
    </div>
  )
}

export default function WorkerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      educacion: [
        { nivel: 'primaria', centro_estudios: '', fecha_culminacion: '', grado_obtenido: '', grado_academico: '' },
        { nivel: 'secundaria', centro_estudios: '', fecha_culminacion: '', grado_obtenido: '', grado_academico: '' },
        { nivel: 'superior_tecnico_otros', centro_estudios: '', fecha_culminacion: '', grado_obtenido: '', grado_academico: '' },
      ],
      hijos: [{ orden: 1, apellidos_nombres: '', fecha_nacimiento: '', edad: '', telefono: '' }],
      padres: [
        { orden: 1, apellidos_nombres: '', fecha_nacimiento: '', nivel_instruccion: '', ocupacion: '' },
        { orden: 2, apellidos_nombres: '', fecha_nacimiento: '', nivel_instruccion: '', ocupacion: '' },
      ],
      contactos_emergencia: [{ orden: 1, apellidos_nombres: '', parentesco: '', telefono: '', otro: '' }],
    }
  })

  const { fields: hijosFields, append: addHijo, remove: removeHijo } = useFieldArray({ control, name: 'hijos' })
  const { fields: contactosFields, append: addContacto, remove: removeContacto } = useFieldArray({ control, name: 'contactos_emergencia' })

  useEffect(() => {
    if (!isEdit) return
    workerService.get(id).then(data => {
      const edu = ['primaria', 'secundaria', 'superior_tecnico_otros'].map(nivel => {
        const found = data.educacion?.find(e => e.nivel === nivel)
        return found || { nivel, centro_estudios: '', fecha_culminacion: '', grado_obtenido: '', grado_academico: '' }
      })
      const hijos = data.hijos?.length
        ? data.hijos
        : [{ orden: 1, apellidos_nombres: '', fecha_nacimiento: '', edad: '', telefono: '' }]
      const padres = [1, 2].map(o => data.padres?.find(p => p.orden === o) || { orden: o, apellidos_nombres: '', fecha_nacimiento: '', nivel_instruccion: '', ocupacion: '' })
      const contactos = data.contactos_emergencia?.length
        ? data.contactos_emergencia
        : [{ orden: 1, apellidos_nombres: '', parentesco: '', telefono: '', otro: '' }]
      reset({ ...data, educacion: edu, hijos, padres, contactos_emergencia: contactos })
    }).catch(() => toast.error('Error al cargar datos')).finally(() => setLoading(false))
  }, [id, isEdit, reset])

  const onSubmit = async (data) => {
    setSubmitting(true)
    const clean = (arr, key) => arr?.filter(i => i[key]) || []
    const payload = {
      ...data,
      educacion: data.educacion?.filter(e => e.centro_estudios || e.fecha_culminacion) || [],
      hijos: clean(data.hijos, 'apellidos_nombres'),
      padres: clean(data.padres, 'apellidos_nombres'),
      contactos_emergencia: clean(data.contactos_emergencia, 'apellidos_nombres'),
      conyugue: data.conyugue?.apellidos_nombres ? data.conyugue : null,
      afp_pension: data.afp_pension?.tipo ? data.afp_pension : null,
    }
    try {
      if (isEdit) {
        await workerService.update(id, payload)
        toast.success('Trabajador actualizado correctamente')
      } else {
        const created = await workerService.create(payload)
        toast.success('Trabajador registrado correctamente')
        navigate(`/trabajadores/${created.id}`)
        return
      }
      navigate(`/trabajadores/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al guardar')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-navy-500 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary py-2 px-3">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-navy-700">
            {isEdit ? 'Editar Trabajador' : 'Nuevo Trabajador'}
          </h1>
          <p className="text-gray-500 text-sm">Ficha de Datos Generales del Trabajador</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

        {/* ── DATOS DEL EMPLEADOR / PERSONAL OBRERO ─────────────── */}
        <div className="form-section">
          <SectionHeader icon={Briefcase} title="Personal Obrero" color="bg-navy-700" />
          <div className="form-section-body grid-cols-1 md:grid-cols-3">
            <Field label="Código *" error={errors.codigo}>
              <input {...register('codigo', { required: 'Requerido' })} placeholder="OB-001" className="field-input" />
            </Field>
            <Field label="Categoría *" error={errors.categoria}>
              <select {...register('categoria', { required: 'Requerido' })} className="field-input">
                <option value="">Seleccionar...</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Ocupación *" error={errors.ocupacion}>
              <input {...register('ocupacion', { required: 'Requerido' })} placeholder="Albañil" className="field-input" />
            </Field>
            <Field label="Frente de Trabajo">
              <input {...register('frente_trabajo')} placeholder="Torre A" className="field-input" />
            </Field>
            <Field label="Partida">
              <input {...register('partida')} placeholder="PT-001" className="field-input" />
            </Field>
            <Field label="Empresa *" error={errors.empresa}>
              <input {...register('empresa', { required: 'Requerido' })} placeholder="Cumbres Monumental SAC" className="field-input" />
            </Field>
            <Field label="Fecha de Ingreso *" error={errors.fecha_ingreso}>
              <input type="date" {...register('fecha_ingreso', { required: 'Requerido' })} className="field-input" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Jornada Laboral">
                <input {...register('jornada_laboral')} defaultValue="48 horas semanales en el horario que determine la empresa" className="field-input" />
              </Field>
            </div>
          </div>
        </div>

        {/* ── DATOS PERSONALES ──────────────────────────────────── */}
        <div className="form-section">
          <SectionHeader icon={User} title="Datos Personales" color="bg-navy-600" />
          <div className="form-section-body grid-cols-1 md:grid-cols-3">
            <Field label="Apellido Paterno *" error={errors.apellido_paterno}>
              <input {...register('apellido_paterno', { required: 'Requerido' })} placeholder="GARCIA" className="field-input uppercase" />
            </Field>
            <Field label="Apellido Materno *" error={errors.apellido_materno}>
              <input {...register('apellido_materno', { required: 'Requerido' })} placeholder="LOPEZ" className="field-input uppercase" />
            </Field>
            <Field label="Nombres *" error={errors.nombres}>
              <input {...register('nombres', { required: 'Requerido' })} placeholder="Juan Carlos" className="field-input" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Domicilio">
                <input {...register('domicilio')} placeholder="Av. Lima 123" className="field-input" />
              </Field>
            </div>
            <Field label="Distrito">
              <input {...register('distrito')} placeholder="San Isidro" className="field-input" />
            </Field>
            <Field label="Provincia">
              <input {...register('provincia')} placeholder="Lima" className="field-input" />
            </Field>
            <Field label="Teléfono">
              <input {...register('telefono')} placeholder="987654321" className="field-input" />
            </Field>
            <Field label="DNI / CE">
              <input {...register('dni')} placeholder="12345678" className="field-input" />
            </Field>
            <Field label="Pasaporte">
              <input {...register('pasaporte')} className="field-input" />
            </Field>
            <Field label="Fecha de Nacimiento">
              <input type="date" {...register('fecha_nacimiento')} className="field-input" />
            </Field>
            <Field label="Correo Electrónico">
              <input type="email" {...register('correo_electronico')} placeholder="juan@email.com" className="field-input" />
            </Field>
          </div>
        </div>

        {/* ── DATOS FINANCIEROS ─────────────────────────────────── */}
        <div className="form-section">
          <SectionHeader icon={CreditCard} title="Datos Financieros" color="bg-navy-500" />
          <div className="form-section-body grid-cols-1 md:grid-cols-3">
            <Field label="Nombre del Banco">
              <select {...register('nombre_banco')} className="field-input">
                <option value="">Seleccionar...</option>
                {BANCOS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="N° de Cuenta">
              <input {...register('numero_cuenta')} placeholder="191-123456-0-12" className="field-input" />
            </Field>
            <Field label="AFP">
              <select {...register('nombre_afp')} className="field-input">
                <option value="">Seleccionar...</option>
                {AFPS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* ── GRADO DE INSTRUCCIÓN ──────────────────────────────── */}
        <div className="form-section">
          <SectionHeader icon={GraduationCap} title="Grado de Instrucción" color="bg-amber-600" />
          <div className="bg-white p-4 space-y-4">
            {[
              { index: 0, label: 'Primaria' },
              { index: 1, label: 'Secundaria' },
              { index: 2, label: 'Superior / Técnico / Otros' },
            ].map(({ index, label }) => (
              <div key={label} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-navy-700 w-full">{label}</span>
                </div>
                <Field label="Centro de Estudios">
                  <input {...register(`educacion.${index}.centro_estudios`)} placeholder="Institución" className="field-input" />
                </Field>
                <Field label="Fecha de Culminación">
                  <input {...register(`educacion.${index}.fecha_culminacion`)} placeholder="MM/AAAA" className="field-input" />
                </Field>
                <Field label="Grado Obtenido">
                  <select {...register(`educacion.${index}.grado_obtenido`)} className="field-input">
                    <option value="">—</option>
                    <option value="completa">Completa</option>
                    <option value="incompleta">Incompleta</option>
                  </select>
                </Field>
              </div>
            ))}
          </div>
        </div>

        {/* ── DATOS DEL CÓNYUGE ─────────────────────────────────── */}
        <div className="form-section">
          <SectionHeader icon={Heart} title="Datos del Cónyuge" color="bg-navy-700" />
          <div className="form-section-body grid-cols-1 md:grid-cols-3">
            <div className="md:col-span-2">
              <Field label="Apellidos y Nombres">
                <input {...register('conyugue.apellidos_nombres')} placeholder="MARTINEZ DIAZ Rosa" className="field-input" />
              </Field>
            </div>
            <Field label="Fecha de Nacimiento">
              <input type="date" {...register('conyugue.fecha_nacimiento')} className="field-input" />
            </Field>
            <Field label="Teléfono">
              <input {...register('conyugue.telefono')} placeholder="956789012" className="field-input" />
            </Field>
            <Field label="Grado de Instrucción">
              <select {...register('conyugue.grado_instruccion')} className="field-input">
                <option value="">—</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Superior">Superior</option>
              </select>
            </Field>
            <Field label="Ocupación">
              <input {...register('conyugue.ocupacion')} placeholder="Ocupación" className="field-input" />
            </Field>
            <Field label="N° Partida de Matrimonio">
              <input {...register('conyugue.n_partida_matrimonio')} className="field-input" />
            </Field>
            <Field label="DNI del Cónyuge">
              <input {...register('conyugue.dni')} className="field-input" />
            </Field>
          </div>
        </div>

        {/* ── HIJOS ─────────────────────────────────────────────── */}
        <div className="form-section">
          <SectionHeader icon={Users} title="Hijos (Menores de 18 años)" color="bg-navy-600" />
          <div className="bg-white p-4 space-y-3">
            {hijosFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-gray-50 rounded-lg p-3">
                <div>
                  <label className="field-label">N°</label>
                  <input value={index + 1} disabled className="field-input bg-gray-100" readOnly />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">Apellidos y Nombres</label>
                  <input {...register(`hijos.${index}.apellidos_nombres`)} className="field-input" />
                </div>
                <div>
                  <label className="field-label">Fecha Nacimiento</label>
                  <input type="date" {...register(`hijos.${index}.fecha_nacimiento`)} className="field-input" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="field-label">Teléfono</label>
                    <input {...register(`hijos.${index}.telefono`)} className="field-input" />
                  </div>
                  {hijosFields.length > 1 && (
                    <button type="button" onClick={() => removeHijo(index)} className="self-end mb-0 p-2 text-red-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {hijosFields.length < 8 && (
              <button type="button" onClick={() => addHijo({ orden: hijosFields.length + 1, apellidos_nombres: '', fecha_nacimiento: '', edad: '', telefono: '' })} className="text-navy-600 text-sm flex items-center gap-1 hover:text-navy-800">
                <Plus size={14} /> Agregar hijo
              </button>
            )}
          </div>
        </div>

        {/* ── PADRES ────────────────────────────────────────────── */}
        <div className="form-section">
          <SectionHeader icon={Users} title="Padres del Colaborador" color="bg-navy-500" />
          <div className="bg-white p-4 space-y-3">
            {[0, 1].map(i => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-navy-700">{i === 0 ? 'Padre' : 'Madre'}</span>
                </div>
                <div>
                  <label className="field-label">Apellidos y Nombres</label>
                  <input {...register(`padres.${i}.apellidos_nombres`)} className="field-input" />
                </div>
                <div>
                  <label className="field-label">Fecha de Nacimiento</label>
                  <input type="date" {...register(`padres.${i}.fecha_nacimiento`)} className="field-input" />
                </div>
                <div>
                  <label className="field-label">Ocupación</label>
                  <input {...register(`padres.${i}.ocupacion`)} className="field-input" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── AFP / PENSIÓN ─────────────────────────────────────── */}
        <div className="form-section">
          <SectionHeader icon={CreditCard} title="AFP / Sistema de Pensiones" color="bg-amber-600" />
          <div className="form-section-body grid-cols-1 md:grid-cols-2">
            <Field label="Tipo de Afiliación">
              <select {...register('afp_pension.tipo')} className="field-input">
                <option value="">Seleccionar...</option>
                <option value="afiliarme_habitat">Deseo afiliarme a AFP Habitat</option>
                <option value="afiliarme_integra">Deseo afiliarme a AFP Integra</option>
                <option value="afiliarme_profuturo">Deseo afiliarme a AFP Profuturo</option>
                <option value="afiliarme_prima">Deseo afiliarme a AFP Prima</option>
                <option value="snp_nuevo">Deseo afiliarme al Sistema Nacional de Pensiones</option>
                <option value="snp_permanece">Deseo permanecer en el Sistema Nacional de Pensiones</option>
                <option value="afp_actual">Ya estoy afiliado a una AFP</option>
              </select>
            </Field>
            <Field label="AFP Actual (si ya está afiliado)">
              <input {...register('afp_pension.afp_actual')} placeholder="AFP Habitat, Integra..." className="field-input" />
            </Field>
          </div>
        </div>

        {/* ── CONTACTOS DE EMERGENCIA ───────────────────────────── */}
        <div className="form-section">
          <SectionHeader icon={Phone} title="Contactos de Emergencia" color="bg-navy-700" />
          <div className="bg-white p-4 space-y-3">
            {contactosFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-gray-50 rounded-lg p-3">
                <div className="md:col-span-2">
                  <label className="field-label">Apellidos y Nombres</label>
                  <input {...register(`contactos_emergencia.${index}.apellidos_nombres`)} className="field-input" />
                </div>
                <div>
                  <label className="field-label">Parentesco</label>
                  <input {...register(`contactos_emergencia.${index}.parentesco`)} placeholder="Madre, Esposa..." className="field-input" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="field-label">Teléfono</label>
                    <input {...register(`contactos_emergencia.${index}.telefono`)} className="field-input" />
                  </div>
                  {contactosFields.length > 1 && (
                    <button type="button" onClick={() => removeContacto(index)} className="self-end p-2 text-red-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {contactosFields.length < 3 && (
              <button type="button" onClick={() => addContacto({ orden: contactosFields.length + 1, apellidos_nombres: '', parentesco: '', telefono: '', otro: '' })} className="text-navy-600 text-sm flex items-center gap-1 hover:text-navy-800">
                <Plus size={14} /> Agregar contacto
              </button>
            )}
          </div>
        </div>

        {/* ── ACCIONES ──────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-4 pb-8">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            <ArrowLeft size={16} /> Cancelar
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEdit ? 'Guardar Cambios' : 'Registrar Trabajador'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
