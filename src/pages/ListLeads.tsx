import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/contexts/I18nContext';
import { Plus, Search, Download, Eye, ExternalLink, Trash2, ArrowLeft, Users, Bookmark, BookmarkCheck, Instagram, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCountries } from '@/hooks/useCountries';
import AddLeadModal from '@/components/AddLeadModal';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function ListLeads() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { findCountry } = useCountries();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteGroupDialog, setDeleteGroupDialog] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user?.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filteredLeads = leads?.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group leads by campaign
  const groupedLeads = filteredLeads?.reduce((groups, lead) => {
    const group = lead.campaign || 'Uncategorized';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(lead);
    return groups;
  }, {} as Record<string, typeof filteredLeads>);

  const handleDeleteGroup = async (groupName: string) => {
    try {
      const leadsToDelete = groupedLeads?.[groupName] || [];
      // نقل العملاء غير المحفوظين إلى سلة المحذوفات
      const unsavedLeadIds = leadsToDelete
        .filter(lead => !lead.is_saved)
        .map(lead => lead.id);

      if (unsavedLeadIds.length > 0) {
        const { error } = await supabase
          .from('leads')
          .update({ deleted_at: new Date().toISOString() })
          .in('id', unsavedLeadIds);

        if (error) throw error;
      }

      const savedCount = leadsToDelete.length - unsavedLeadIds.length;
      
      if (savedCount > 0) {
        toast.success(`تم نقل ${unsavedLeadIds.length} عميل إلى سلة المحذوفات. تم الاحتفاظ بـ ${savedCount} عميل محفوظ`);
      } else {
        toast.success(`تم نقل المجموعة "${groupName}" إلى سلة المحذوفات`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['leads', user?.id] });
      setDeleteGroupDialog(null);
    } catch (error) {
      console.error('Error moving group to trash:', error);
      toast.error('حدث خطأ أثناء نقل المجموعة');
    }
  };

  const handleToggleSave = async (leadId: string, currentSavedState: boolean) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ is_saved: !currentSavedState })
        .eq('id', leadId);

      if (error) throw error;

      toast.success(!currentSavedState ? 'تم حفظ العميل' : 'تم إلغاء الحفظ');
      queryClient.invalidateQueries({ queryKey: ['leads', user?.id] });
    } catch (error) {
      console.error('Error toggling save:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-blur-in">
        <div className="flex items-center gap-4">
          {selectedGroup && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedGroup(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              {selectedGroup || t('leads.title')}
            </h1>
            <p className="text-muted-foreground">
              {selectedGroup ? `${groupedLeads?.[selectedGroup]?.length || 0} leads in this group` : 'Manage your lead pipeline'}
            </p>
          </div>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90" onClick={() => setAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('common.add')} Lead
        </Button>
      </div>

      <AddLeadModal 
        open={addModalOpen} 
        onOpenChange={setAddModalOpen}
        onLeadCreated={() => {
          window.location.reload();
        }}
      />

      {!selectedGroup && (
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">All Groups</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">{t('common.loading')}</p>
            ) : !filteredLeads || filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No leads found</p>
                <p className="text-sm text-muted-foreground">
                  Start searching to find local businesses without websites
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedLeads || {}).map(([groupName, groupLeads]) => (
                  <Card
                    key={groupName}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2"
                    onClick={() => setSelectedGroup(groupName)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{groupName}</CardTitle>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="text-sm">{groupLeads.length} leads</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteGroupDialog(groupName);
                          }}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Avg Rating</span>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium">
                              {(groupLeads.reduce((sum, lead) => sum + (lead.rating || 0), 0) / groupLeads.length).toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Without Website</span>
                          <Badge variant="default">
                            {groupLeads.filter(l => !l.has_website).length}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedGroup && groupedLeads?.[selectedGroup] && (
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">{selectedGroup}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteGroupDialog(selectedGroup)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  حذف المجموعة
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>{t('leads.business')}</TableHead>
                  <TableHead>{t('leads.contact')}</TableHead>
                  <TableHead>{t('leads.rating')}</TableHead>
                  <TableHead>Last Review</TableHead>
                  <TableHead>{t('leads.status')}</TableHead>
                  <TableHead>حفظ</TableHead>
                  <TableHead>{t('leads.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedLeads[selectedGroup].map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell>
                      {lead.image_url ? (
                        <img 
                          src={lead.image_url} 
                          alt={lead.name}
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setSelectedImage(lead.image_url)}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">No Image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          {findCountry(lead.country)?.flag} {lead.city}, {findCountry(lead.country)?.name_en}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.phone && <p className="text-sm">{lead.phone}</p>}
                        {lead.email && <p className="text-sm text-muted-foreground">{lead.email}</p>}
                        {lead.additional_emails && lead.additional_emails.length > 0 && (
                          <div className="space-y-0.5">
                            {lead.additional_emails.map((email: string, idx: number) => (
                              <p key={idx} className="text-xs text-muted-foreground">{email}</p>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {lead.instagram && Array.isArray(lead.instagram) && lead.instagram.map((account, idx) => (
                            <a 
                              key={`instagram-${idx}`}
                              href={account.startsWith('http') ? account : `https://instagram.com/${account}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title={account}
                            >
                              <Instagram className="h-4 w-4 text-pink-600 hover:text-pink-700 transition-colors" />
                            </a>
                          ))}
                          {lead.facebook && Array.isArray(lead.facebook) && lead.facebook.map((account, idx) => (
                            <a 
                              key={`facebook-${idx}`}
                              href={account.startsWith('http') ? account : `https://facebook.com/${account}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title={account}
                            >
                              <Facebook className="h-4 w-4 text-blue-600 hover:text-blue-700 transition-colors" />
                            </a>
                          ))}
                          {lead.twitter && Array.isArray(lead.twitter) && lead.twitter.map((account, idx) => (
                            <a 
                              key={`twitter-${idx}`}
                              href={account.startsWith('http') ? account : `https://twitter.com/${account}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title={account}
                            >
                              <Twitter className="h-4 w-4 text-sky-500 hover:text-sky-600 transition-colors" />
                            </a>
                          ))}
                          {lead.youtube && Array.isArray(lead.youtube) && lead.youtube.map((account, idx) => (
                            <a 
                              key={`youtube-${idx}`}
                              href={account.startsWith('http') ? account : `https://youtube.com/${account}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title={account}
                            >
                              <Youtube className="h-4 w-4 text-red-600 hover:text-red-700 transition-colors" />
                            </a>
                          ))}
                          {lead.linkedin && Array.isArray(lead.linkedin) && lead.linkedin.map((account, idx) => (
                            <a 
                              key={`linkedin-${idx}`}
                              href={account.startsWith('http') ? account : `https://linkedin.com/in/${account}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              title={account}
                            >
                              <Linkedin className="h-4 w-4 text-blue-700 hover:text-blue-800 transition-colors" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        <span>{lead.rating?.toFixed(1) || 'N/A'}</span>
                        <span className="text-muted-foreground text-sm">({lead.reviews})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {lead.last_review_date || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {lead.has_website && lead.website ? (
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-secondary/80 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(lead.website, '_blank');
                          }}
                        >
                          Has Website
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          {t('leads.noWebsite')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSave(lead.id, lead.is_saved || false);
                        }}
                        className={lead.is_saved ? "text-primary" : "text-muted-foreground"}
                      >
                        {lead.is_saved ? (
                          <BookmarkCheck className="h-5 w-5" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {lead.maps_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(lead.maps_url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Maps
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/leads/${lead.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('common.view')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteGroupDialog} onOpenChange={() => setDeleteGroupDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم نقل جميع العملاء غير المحفوظين في المجموعة "{deleteGroupDialog}" إلى سلة المحذوفات. 
              العملاء المحفوظين سيتم الاحتفاظ بهم في صفحة المحفوظات.
              يمكنك استرجاع العملاء من سلة المحذوفات لاحقاً.
              {groupedLeads?.[deleteGroupDialog || ''] && (
                <div className="mt-2 text-sm">
                  <p>إجمالي العملاء: {groupedLeads[deleteGroupDialog || ''].length}</p>
                  <p>عملاء محفوظين: {groupedLeads[deleteGroupDialog || ''].filter(l => l.is_saved).length}</p>
                  <p>سيتم نقل إلى المحذوفات: {groupedLeads[deleteGroupDialog || ''].filter(l => !l.is_saved).length}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGroupDialog && handleDeleteGroup(deleteGroupDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف المجموعة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <img 
            src={selectedImage || ''} 
            alt="Full view"
            className="w-full h-auto rounded-lg"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
