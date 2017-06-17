#version 330 core

in VS_OUT
{
	vec3 position;
	vec3 normal;
	vec2 texcoord;
}fs_in;

uniform vec3 viewPos;

//material parameters
uniform vec3 albedo;
uniform float metallic;
uniform float roughness;
uniform float ao;

//lights
uniform vec3 lightPositions[4];
uniform vec3 lightColors[4];

out vec4 FargColor;

const float PI = 3.14159265359;

float distributionGGX(vec3 N, vec3 H, float roughness);

float  geometrySchlickGGX(float NdotV, float roughness);

float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness);

vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0);

void main()
{
	vec3 N = normalize(fs_in.normal);		//���򻯷�����
	vec3 V = normalize(viewPos - fs_in.position);		//�����غ��۾�֮��ķ�������
	
	vec3 F0 = vec3(0.04);
	F0 = mix(F0, albedo, metallic);
	
	//���䷽��
	vec3 L0 = vec3(0.0);
	for(int i = 0; i < 4; ++i)
	{
		//����ÿ�����ߵķ�����
		vec3 L = normalize(lightPositions[i] - fs_in.position);
		vec3 H = normalize(V+ L);
		float distance = length(lightPositions[i] - fs_in.position);
		float attenuation = 1.0f / (distance * distance);
		vec3 radiance = lightColors[i] * attenuation;
		
		//cook-torrance BRDF
		float NDF = distributionGGX(N, H, roughness);
		float G = geometrySmith(N, V, L, roughness);
		vec3 F = fresnelSchlickRoughness(max(dot(H, V), 0.0f), F0);
		
		vec3 kS = F;
		vec3 kD = vec3(1.0) - kS;
		kD *= 1.0 - metallic;
		
		vec3 nominator = NDF * G * F;
		float denominator = 4 * max(dot(N, V), 0.0f) * max(dot(N, L), 0.0f) + 0.001;
		
		vec3 specular = nominator / denominator;
		
		float NdotL = max(dot(N, L), 0.0f);
		L0 += (kD * albedo / PI + specular) * radiance * NdotL;
	}
	
	vec3 ambient = vec3(0.03) * albedo *ao;
	vec3 color = ambient + L0;
	
	color = color / (color + vec3(1.0));
	color = pow(color, vec3(1.0 / 2.2));
	
	FargColor = vec4(color, 1.0f);
}

float distributionGGX(vec3 N, vec3 H, float roughness)
{
	float a = roughness * roughness;
	float a2 = a * a;
	float NdotH = max(dot(N, H), 0.0f);
	float NdotH2 = NdotH * NdotH;
	
	float nom = a2;
	float dnom = (NdotH * (a2 - 1.0) + 1.0f);
	dnom = PI * dnom * dnom;
	
	return nom / dnom;
}

float  geometrySchlickGGX(float NdotV, float roughness)
{
	float r = (roughness + 1.0);
	float k = (r * r) / 8.0f;
	
	float nom = NdotV;
	float denom = NdotV * (1.0 - k) + k;
	denom = PI * denom * denom;
	
	return nom / denom;
}

float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
	float NdotV = max(dot(N, V), 0.0f);
	float NdotL = max(dot(N, L) ,0.0f);
	float ggx2 = geometrySchlickGGX(NdotV, roughness);
	float ggx1 = geometrySchlickGGX(NdotL, roughness);
	
	return ggx1 * ggx2;
}

vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0)
{
	return F0 + (1.0f - F0) * pow(1.0 - cosTheta, 5.0f);
}