#version 330 core

in vec3 worldPosition;
in vec3 worldNormal;
in vec2 texcoord;

struct LightColor
{
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
};

uniform sampler2D tex;

uniform LightColor lightColor;
uniform vec3			 lightDirection;
uniform vec3			 viewPos;
uniform float			 shininess;

out vec4 color;

vec2 reverseY(vec2 texcoord);

void main()
{
	//环境光
	vec3 ambient = lightColor.ambient * vec3(texture2D(tex, reverseY(texcoord)));
	
	//漫反射光
	vec3 norm = normalize(worldNormal);
	float diff = max(dot(norm, lightDirection), 0.0f);
	vec3 diffuse = lightColor.diffuse * diff * vec3(texture2D(tex, reverseY(texcoord)));
	
	//镜面高光
	vec3 viewDir = normalize(viewPos - worldPosition);
	vec3 lightDir = normalize(lightDirection);
	vec3 reflectDir = reflect(-lightDir, norm);
	float spec = pow(max(dot(reflectDir, viewDir), 0.0f), 32.0f);
	vec3 specular = lightColor.specular * spec * vec3(texture2D(tex, reverseY(texcoord)));
	
	vec3 result = ambient + diffuse + specular;
	color = vec4(result, 1.0f);
}

vec2 reverseY(vec2 texcoord)
{
	return vec2(texcoord.x, 1.0f - texcoord.y);
}