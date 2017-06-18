#version 330 core

in vec2 texcoord;

uniform sampler2D text;
uniform vec3 textColor;

out vec4 FragColor;

void main()
{
	vec4 sampled = vec4(1.0, 1.0, 1.0, texture2D(text, texcoord).r);
	FragColor = vec4(textColor, 1.0) * sampled;
}