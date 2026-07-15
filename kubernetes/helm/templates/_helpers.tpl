{{- define "dersplatform.namespace" -}}
{{- default "dersplatform" .Values.global.namespace -}}
{{- end -}}

{{- define "dersplatform.name" -}}
{{- default "dersplatform" .Chart.Name -}}
{{- end -}}

{{- define "dersplatform.labels" -}}
app.kubernetes.io/name: {{ include "dersplatform.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: dersplatform
{{- end -}}
