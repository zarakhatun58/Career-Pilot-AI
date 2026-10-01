'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/shared/page-header';
import { DemoBadge } from '@/components/shared/demo-badge';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Trophy,
  Languages,
  HeartHandshake,
  Plus,
  Trash2,
  Sparkles,
  Save,
  Download,
  Eye,
  ChevronUp,
  ChevronDown,
  FileText,
  Wand2,
  Lightbulb,
} from 'lucide-react';
import { demoResumeContent, demoResumes, createEmptyResumeContent } from '@/lib/demo-data';
import { generateId, capitalize } from '@/lib/utils/score';
import type {
  ResumeContent,
  WorkExperience,
  Education,
  SkillItem,
  Project,
  Certification,
  Language,
  ResumeTemplate,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

const templateOptions: { value: ResumeTemplate; label: string }[] = [
  { value: 'classic-ats', label: 'Classic ATS' },
  { value: 'modern-professional', label: 'Modern Professional' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'software-engineer', label: 'Software Engineer' },
];

const aiActions = [
  { label: 'Improve Summary', icon: Wand2, action: 'improve-summary' },
  { label: 'Generate Summary', icon: Sparkles, action: 'generate-summary' },
  { label: 'Suggest Keywords', icon: Lightbulb, action: 'suggest-keywords' },
];

export default function ResumeEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const isNew = params.id === 'new';

  const existingResume = isNew ? null : demoResumes.find((r) => r.id === params.id);
  const [content, setContent] = useState<ResumeContent>(
    existingResume?.content || createEmptyResumeContent()
  );
  const [title, setTitle] = useState(existingResume?.title || 'Untitled Resume');
  const [template, setTemplate] = useState<ResumeTemplate>(
    existingResume?.template || 'modern-professional'
  );
  const [activeTab, setActiveTab] = useState('personal');

  const handleSave = () => {
    toast({
      title: 'Resume saved',
      description: 'Your resume has been saved as a draft.',
    });
  };

  const handleDownload = () => {
    toast({
      title: 'Preparing PDF',
      description: 'Your resume PDF is being generated.',
    });
  };

  const handleAIAction = (action: string) => {
    if (action === 'improve-summary' || action === 'generate-summary') {
      const improved = content.summary || 'Professional with a passion for building impactful products.';
      const enhanced = `Results-driven ${content.personalInfo.title || 'professional'} with proven expertise in ${content.skills.slice(0, 3).map((s) => s.name).join(', ')}. Track record of delivering high-quality solutions and driving measurable impact across cross-functional teams.`;
      setContent({ ...content, summary: enhanced });
      toast({
        title: 'AI suggestion applied',
        description: 'Summary improved with AI. Review and edit as needed — this is a suggestion, not your original content.',
      });
    } else if (action === 'suggest-keywords') {
      toast({
        title: 'Keywords suggested',
        description: 'Based on your skills: ' + content.skills.slice(0, 5).map((s) => s.name).join(', '),
      });
    }
  };

  const updatePersonalInfo = (field: keyof ResumeContent['personalInfo'], value: string) => {
    setContent({
      ...content,
      personalInfo: { ...content.personalInfo, [field]: value },
    });
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: generateId(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    setContent({ ...content, workExperience: [...content.workExperience, newExp] });
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: string | boolean) => {
    setContent({
      ...content,
      workExperience: content.workExperience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeWorkExperience = (id: string) => {
    setContent({
      ...content,
      workExperience: content.workExperience.filter((exp) => exp.id !== id),
    });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
    };
    setContent({ ...content, education: [...content.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setContent({
      ...content,
      education: content.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    setContent({
      ...content,
      education: content.education.filter((edu) => edu.id !== id),
    });
  };

  const addSkill = () => {
    const newSkill: SkillItem = { id: generateId(), name: '', level: 'intermediate' };
    setContent({ ...content, skills: [...content.skills, newSkill] });
  };

  const updateSkill = (id: string, field: keyof SkillItem, value: string) => {
    setContent({
      ...content,
      skills: content.skills.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    });
  };

  const removeSkill = (id: string) => {
    setContent({ ...content, skills: content.skills.filter((s) => s.id !== id) });
  };

  const addProject = () => {
    const newProj: Project = {
      id: generateId(),
      name: '',
      description: '',
      technologies: [],
    };
    setContent({ ...content, projects: [...content.projects, newProj] });
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    setContent({
      ...content,
      projects: content.projects.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

  const removeProject = (id: string) => {
    setContent({ ...content, projects: content.projects.filter((p) => p.id !== id) });
  };

  const addCertification = () => {
    const newCert: Certification = { id: generateId(), name: '', issuer: '', date: '' };
    setContent({ ...content, certifications: [...content.certifications, newCert] });
  };

  const removeCertification = (id: string) => {
    setContent({
      ...content,
      certifications: content.certifications.filter((c) => c.id !== id),
    });
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setContent({
      ...content,
      certifications: content.certifications.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    });
  };

  const addLanguage = () => {
    const newLang: Language = { id: generateId(), name: '', proficiency: 'conversational' };
    setContent({ ...content, languages: [...content.languages, newLang] });
  };

  const removeLanguage = (id: string) => {
    setContent({ ...content, languages: content.languages.filter((l) => l.id !== id) });
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setContent({
      ...content,
      languages: content.languages.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      ),
    });
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'languages', label: 'Languages', icon: Languages },
    { id: 'volunteer', label: 'Volunteer', icon: HeartHandshake },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? 'Create Resume' : 'Edit Resume'}
        description="Build your resume with AI-powered suggestions"
        badge={<DemoBadge />}
        action={
          <>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> Save
            </Button>
          </>
        }
      />

      {/* Title & Template */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="resume-title">Resume Title</Label>
          <Input
            id="resume-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer Resume"
          />
        </div>
        <div className="space-y-2">
          <Label>Template</Label>
          <Select value={template} onValueChange={(v) => setTemplate(v as ResumeTemplate)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templateOptions.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto scrollbar-thin">
              <TabsList className="h-auto flex-wrap">
                {sections.map((section) => (
                  <TabsTrigger key={section.id} value={section.id} className="gap-1.5">
                    <section.icon className="h-3.5 w-3.5" />
                    {section.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Personal Info */}
            <TabsContent value="personal" className="space-y-4">
              <Card className="border-border">
                <CardContent className="space-y-4 p-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={content.personalInfo.fullName}
                        onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                        placeholder="Alex Morgan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Professional Title</Label>
                      <Input
                        value={content.personalInfo.title || ''}
                        onChange={(e) => updatePersonalInfo('title', e.target.value)}
                        placeholder="Senior Frontend Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={content.personalInfo.email}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        placeholder="alex@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        value={content.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={content.personalInfo.location}
                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={content.personalInfo.website || ''}
                        onChange={(e) => updatePersonalInfo('website', e.target.value)}
                        placeholder="alexmorgan.dev"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>LinkedIn</Label>
                      <Input
                        value={content.personalInfo.linkedin || ''}
                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                        placeholder="linkedin.com/in/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GitHub</Label>
                      <Input
                        value={content.personalInfo.github || ''}
                        onChange={(e) => updatePersonalInfo('github', e.target.value)}
                        placeholder="github.com/..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary */}
            <TabsContent value="summary" className="space-y-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Professional Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={content.summary}
                    onChange={(e) => setContent({ ...content, summary: e.target.value })}
                    placeholder="Write a concise summary of your experience and skills..."
                    rows={5}
                  />
                  <div className="flex flex-wrap gap-2">
                    {aiActions.map((action) => (
                      <Button
                        key={action.action}
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleAIAction(action.action)}
                      >
                        <action.icon className="h-3.5 w-3.5 text-accent" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                  <div className="rounded-md bg-accent/5 px-3 py-2 text-xs text-muted-foreground">
                    <Sparkles className="mr-1 inline h-3 w-3 text-accent" />
                    AI suggestions are recommendations. You provide the facts — AI helps you word them better.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Work Experience */}
            <TabsContent value="experience" className="space-y-4">
              {content.workExperience.map((exp) => (
                <Card key={exp.id} className="border-border">
                  <CardContent className="space-y-3 p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateWorkExperience(exp.id, 'position', e.target.value)}
                          placeholder="Senior Frontend Engineer"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                          placeholder="TechCorp Inc."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Location</Label>
                        <Input
                          value={exp.location || ''}
                          onChange={(e) => updateWorkExperience(exp.id, 'location', e.target.value)}
                          placeholder="San Francisco, CA"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs">Start Date</Label>
                          <Input
                            value={exp.startDate}
                            onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                            placeholder="2021-03"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">End Date</Label>
                          <Input
                            value={exp.endDate || ''}
                            disabled={exp.current}
                            onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                            placeholder="Present"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                        placeholder="Describe your achievements and responsibilities..."
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Wand2 className="h-3.5 w-3.5 text-accent" /> Improve with AI
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWorkExperience(exp.id)}
                        className="gap-1.5 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addWorkExperience} className="w-full gap-2">
                <Plus className="h-4 w-4" /> Add Experience
              </Button>
            </TabsContent>

            {/* Education */}
            <TabsContent value="education" className="space-y-4">
              {content.education.map((edu) => (
                <Card key={edu.id} className="border-border">
                  <CardContent className="space-y-3 p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          placeholder="University of California, Berkeley"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          placeholder="B.S. Computer Science"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Start Date</Label>
                        <Input
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                          placeholder="2014-09"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">End Date</Label>
                        <Input
                          value={edu.endDate || ''}
                          onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                          placeholder="2018-05"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(edu.id)}
                      className="gap-1.5 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addEducation} className="w-full gap-2">
                <Plus className="h-4 w-4" /> Add Education
              </Button>
            </TabsContent>

            {/* Skills */}
            <TabsContent value="skills" className="space-y-4">
              <Card className="border-border">
                <CardContent className="space-y-3 p-4">
                  {content.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-2">
                      <Input
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                        placeholder="React"
                        className="flex-1"
                      />
                      <Select
                        value={skill.level || 'intermediate'}
                        onValueChange={(v) => updateSkill(skill.id, 'level', v)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSkill(skill.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addSkill} className="w-full gap-2">
                    <Plus className="h-4 w-4" /> Add Skill
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects */}
            <TabsContent value="projects" className="space-y-4">
              {content.projects.map((proj) => (
                <Card key={proj.id} className="border-border">
                  <CardContent className="space-y-3 p-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Project Name</Label>
                      <Input
                        value={proj.name}
                        onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                        placeholder="Design System"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={proj.description}
                        onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                        placeholder="Describe the project..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Technologies (comma separated)</Label>
                      <Input
                        value={proj.technologies.join(', ')}
                        onChange={(e) =>
                          updateProject(
                            proj.id,
                            'technologies',
                            e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                          )
                        }
                        placeholder="React, TypeScript, Tailwind"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProject(proj.id)}
                      className="gap-1.5 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addProject} className="w-full gap-2">
                <Plus className="h-4 w-4" /> Add Project
              </Button>
            </TabsContent>

            {/* Certifications */}
            <TabsContent value="certifications" className="space-y-4">
              {content.certifications.map((cert) => (
                <Card key={cert.id} className="border-border">
                  <CardContent className="space-y-3 p-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Certification Name</Label>
                        <Input
                          value={cert.name}
                          onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                          placeholder="AWS Certified Developer"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Issuer</Label>
                        <Input
                          value={cert.issuer}
                          onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                          placeholder="Amazon Web Services"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertification(cert.id)}
                      className="gap-1.5 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addCertification} className="w-full gap-2">
                <Plus className="h-4 w-4" /> Add Certification
              </Button>
            </TabsContent>

            {/* Achievements */}
            <TabsContent value="achievements" className="space-y-4">
              <Card className="border-border">
                <CardContent className="space-y-3 p-4">
                  {content.achievements.map((achievement, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={achievement}
                        onChange={(e) => {
                          const newAch = [...content.achievements];
                          newAch[idx] = e.target.value;
                          setContent({ ...content, achievements: newAch });
                        }}
                        placeholder="Speaker at ReactConf 2023"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setContent({
                            ...content,
                            achievements: content.achievements.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setContent({ ...content, achievements: [...content.achievements, ''] })
                    }
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Achievement
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Languages */}
            <TabsContent value="languages" className="space-y-4">
              <Card className="border-border">
                <CardContent className="space-y-3 p-4">
                  {content.languages.map((lang) => (
                    <div key={lang.id} className="flex items-center gap-2">
                      <Input
                        value={lang.name}
                        onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                        placeholder="English"
                        className="flex-1"
                      />
                      <Select
                        value={lang.proficiency}
                        onValueChange={(v) => updateLanguage(lang.id, 'proficiency', v)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="fluent">Fluent</SelectItem>
                          <SelectItem value="native">Native</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLanguage(lang.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addLanguage} className="w-full gap-2">
                    <Plus className="h-4 w-4" /> Add Language
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Volunteer */}
            <TabsContent value="volunteer" className="space-y-4">
              <Card className="border-border">
                <CardContent className="space-y-3 p-4">
                  {content.volunteer.map((vol, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={vol}
                        onChange={(e) => {
                          const newVol = [...content.volunteer];
                          newVol[idx] = e.target.value;
                          setContent({ ...content, volunteer: newVol });
                        }}
                        placeholder="Volunteer work description..."
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setContent({
                            ...content,
                            volunteer: content.volunteer.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() =>
                      setContent({ ...content, volunteer: [...content.volunteer, ''] })
                    }
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Volunteer
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Eye className="h-4 w-4" /> Live Preview
            </span>
            <Badge variant="secondary">{capitalize(template.replace(/-/g, ' '))}</Badge>
          </div>
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
            {/* Resume Preview Content */}
            <div className="space-y-4">
              <div className="border-b border-border pb-3">
                <h2 className="text-xl font-bold text-foreground">
                  {content.personalInfo.fullName || 'Your Name'}
                </h2>
                <p className="text-sm text-accent">
                  {content.personalInfo.title || 'Professional Title'}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {content.personalInfo.email && <span>{content.personalInfo.email}</span>}
                  {content.personalInfo.phone && <span>{content.personalInfo.phone}</span>}
                  {content.personalInfo.location && <span>{content.personalInfo.location}</span>}
                  {content.personalInfo.website && <span>{content.personalInfo.website}</span>}
                </div>
              </div>

              {content.summary && (
                <div>
                  <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-foreground">
                    Summary
                  </h3>
                  <p className="text-sm text-foreground">{content.summary}</p>
                </div>
              )}

              {content.workExperience.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground">
                    Experience
                  </h3>
                  <div className="space-y-3">
                    {content.workExperience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground">
                            {exp.position || 'Position'}
                            {exp.company && <span className="font-normal text-muted-foreground"> — {exp.company}</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {exp.startDate} {exp.endDate && `— ${exp.endDate}`}
                          </p>
                        </div>
                        {exp.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {content.education.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground">
                    Education
                  </h3>
                  {content.education.map((edu) => (
                    <div key={edu.id} className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        {edu.degree || 'Degree'}
                        {edu.institution && (
                          <span className="font-normal text-muted-foreground"> — {edu.institution}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {edu.startDate} {edu.endDate && `— ${edu.endDate}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {content.skills.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {content.skills.filter((s) => s.name).map((skill) => (
                      <Badge key={skill.id} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {content.projects.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground">
                    Projects
                  </h3>
                  <div className="space-y-2">
                    {content.projects.map((proj) => (
                      <div key={proj.id}>
                        <p className="text-sm font-semibold text-foreground">
                          {proj.name || 'Project Name'}
                        </p>
                        {proj.description && (
                          <p className="text-sm text-muted-foreground">{proj.description}</p>
                        )}
                        {proj.technologies.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {proj.technologies.map((tech) => (
                              <span key={tech} className="text-xs text-muted-foreground">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {content.certifications.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground">
                    Certifications
                  </h3>
                  {content.certifications.map((cert) => (
                    <div key={cert.id} className="text-sm">
                      <span className="font-semibold text-foreground">{cert.name || 'Certification'}</span>
                      {cert.issuer && <span className="text-muted-foreground"> — {cert.issuer}</span>}
                    </div>
                  ))}
                </div>
              )}

              {content.achievements.filter((a) => a).length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground">
                    Achievements
                  </h3>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                    {content.achievements.filter((a) => a).map((ach, idx) => (
                      <li key={idx}>{ach}</li>
                    ))}
                  </ul>
                </div>
              )}

              {content.languages.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground">
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                    {content.languages.filter((l) => l.name).map((lang) => (
                      <span key={lang.id}>
                        {lang.name} <span className="text-muted-foreground/60">({capitalize(lang.proficiency)})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
